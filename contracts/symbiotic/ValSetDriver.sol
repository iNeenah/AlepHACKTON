// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./VotingPowerProvider.sol";
import "./KeyRegistry.sol";

/**
 * @title ValSetDriver
 * @dev Derives and exposes epoched validator sets for off-chain Relay nodes
 * Integrates VotingPowerProvider and KeyRegistry to create weighted validator sets
 */
contract ValSetDriver is Ownable, ReentrancyGuard {
    
    // =====================================================
    // STRUCTS & ENUMS
    // =====================================================
    
    struct ValidatorInfo {
        address operator;
        uint256 votingPower;
        uint256[2] blsPubkey;
        uint256[4] blsPubkeyG2;
        address ecdsaPubkey;
        VotingPowerProvider.TrancheType primaryTranche;
        bool isActive;
        uint256 lastActiveEpoch;
    }
    
    struct ValidatorSet {
        uint256 epoch;
        uint256 totalVotingPower;
        uint256 validatorCount;
        bytes32 setHash;           // Hash of the validator set for verification
        uint256 threshold;         // Minimum voting power needed for consensus (66%)
        bool isFinalized;
        uint256 finalizedBlock;
        mapping(address => ValidatorInfo) validators;
        address[] validatorAddresses;
    }
    
    struct EpochMetrics {
        uint256 totalStaked;
        uint256 totalValidators;
        uint256 seniorValidators;
        uint256 mezzanineValidators;
        uint256 juniorValidators;
        uint256 averageVotingPower;
        uint256 topValidatorPower;
        uint256 consensusThreshold;
    }
    
    // =====================================================
    // STATE VARIABLES
    // =====================================================
    
    // Core contracts
    VotingPowerProvider public immutable votingPowerProvider;
    KeyRegistry public immutable keyRegistry;
    
    // Validator sets by epoch
    mapping(uint256 => ValidatorSet) public validatorSets;
    mapping(uint256 => EpochMetrics) public epochMetrics;
    
    // Current state
    uint256 public currentEpoch;
    uint256 public latestFinalizedEpoch;
    
    // Configuration
    uint256 public minVotingPower = 1 ether;      // Minimum power to be validator
    uint256 public maxValidators = 125;           // Max validators per epoch (for BLS simple)
    uint256 public consensusThreshold = 6666;    // 66.66% in basis points
    bool public autoFinalization = true;
    
    // Performance tracking
    mapping(address => uint256) public validatorPerformance; // operator => score
    mapping(uint256 => mapping(address => bool)) public epochParticipation;
    
    // =====================================================
    // EVENTS
    // =====================================================
    
    event ValidatorSetGenerated(
        uint256 indexed epoch,
        uint256 validatorCount,
        uint256 totalVotingPower,
        bytes32 setHash
    );
    
    event ValidatorSetFinalized(
        uint256 indexed epoch,
        uint256 finalizedBlock,
        uint256 threshold
    );
    
    event ValidatorAdded(
        uint256 indexed epoch,
        address indexed operator,
        uint256 votingPower,
        VotingPowerProvider.TrancheType primaryTranche
    );
    
    event ValidatorRemoved(
        uint256 indexed epoch,
        address indexed operator,
        string reason
    );
    
    event EpochAdvanced(uint256 oldEpoch, uint256 newEpoch);
    event ConfigurationUpdated(string parameter, uint256 newValue);
    event PerformanceUpdated(address indexed operator, uint256 newScore);
    
    // =====================================================
    // MODIFIERS
    // =====================================================
    
    modifier validEpoch(uint256 epoch) {
        require(epoch > 0 && epoch <= currentEpoch, "Invalid epoch");
        _;
    }
    
    modifier onlyUnfinalized(uint256 epoch) {
        require(!validatorSets[epoch].isFinalized, "Epoch already finalized");
        _;
    }
    
    // =====================================================
    // CONSTRUCTOR
    // =====================================================
    
    constructor(
        address _votingPowerProvider,
        address _keyRegistry
    ) {
        require(_votingPowerProvider != address(0), "Invalid VotingPowerProvider");
        require(_keyRegistry != address(0), "Invalid KeyRegistry");
        
        votingPowerProvider = VotingPowerProvider(_votingPowerProvider);
        keyRegistry = KeyRegistry(_keyRegistry);
        currentEpoch = 1;
    }
    
    // =====================================================
    // VALIDATOR SET GENERATION
    // =====================================================
    
    /**
     * @dev Generate validator set for the current epoch
     */
    function generateValidatorSet() external returns (uint256 validatorCount) {
        return _generateValidatorSet(currentEpoch);
    }
    
    /**
     * @dev Generate validator set for a specific epoch
     */
    function generateValidatorSetForEpoch(uint256 epoch) 
        external 
        onlyOwner 
        validEpoch(epoch)
        onlyUnfinalized(epoch)
        returns (uint256 validatorCount) 
    {
        return _generateValidatorSet(epoch);
    }
    
    /**
     * @dev Internal function to generate validator set
     */
    function _generateValidatorSet(uint256 epoch) internal returns (uint256) {
        require(!validatorSets[epoch].isFinalized, "Epoch already finalized");
        
        // Get all registered operators from KeyRegistry
        address[] memory allOperators = keyRegistry.getAllOperators();
        require(allOperators.length > 0, "No operators registered");
        
        // Temporary array to store valid validators
        ValidatorInfo[] memory tempValidators = new ValidatorInfo[](allOperators.length);
        uint256 validCount = 0;
        uint256 totalPower = 0;
        
        // Process each operator
        for (uint i = 0; i < allOperators.length; i++) {
            address operator = allOperators[i];
            
            // Check if operator has sufficient voting power
            uint256 votingPower = votingPowerProvider.getVotingPower(operator, epoch);
            if (votingPower < minVotingPower) continue;
            
            // Check if operator has registered keys
            (bool hasBlsKey, bool hasEcdsaKey,,) = keyRegistry.getOperatorSummary(operator);
            if (!hasBlsKey) continue; // BLS key is mandatory for signature aggregation
            
            // Get keys
            (uint256[2] memory blsPubkey, uint256[4] memory blsPubkeyG2,,,) = keyRegistry.getBlsKey(operator);
            (address ecdsaPubkey,,,) = keyRegistry.getEcdsaKey(operator);
            
            // Determine primary tranche
            VotingPowerProvider.TrancheType primaryTranche = _getPrimaryTranche(operator);
            
            // Add to temporary array
            tempValidators[validCount] = ValidatorInfo({
                operator: operator,
                votingPower: votingPower,
                blsPubkey: blsPubkey,
                blsPubkeyG2: blsPubkeyG2,
                ecdsaPubkey: ecdsaPubkey,
                primaryTranche: primaryTranche,
                isActive: true,
                lastActiveEpoch: epoch
            });
            
            validCount++;
            totalPower += votingPower;
            
            // Stop if we reach max validators
            if (validCount >= maxValidators) break;
        }
        
        require(validCount > 0, "No valid validators found");
        
        // Sort validators by voting power (descending)
        _sortValidatorsByPower(tempValidators, validCount);
        
        // Store in validator set
        ValidatorSet storage valSet = validatorSets[epoch];
        valSet.epoch = epoch;
        valSet.totalVotingPower = totalPower;
        valSet.validatorCount = validCount;
        valSet.threshold = (totalPower * consensusThreshold) / 10000;
        
        // Clear existing validators array
        delete valSet.validatorAddresses;
        
        // Add validators to set
        for (uint i = 0; i < validCount; i++) {
            ValidatorInfo memory validator = tempValidators[i];
            valSet.validators[validator.operator] = validator;
            valSet.validatorAddresses.push(validator.operator);
            
            emit ValidatorAdded(epoch, validator.operator, validator.votingPower, validator.primaryTranche);
        }
        
        // Generate set hash
        valSet.setHash = _generateSetHash(epoch);
        
        // Update metrics
        _updateEpochMetrics(epoch);
        
        // Auto-finalize if enabled
        if (autoFinalization) {
            _finalizeValidatorSet(epoch);
        }
        
        emit ValidatorSetGenerated(epoch, validCount, totalPower, valSet.setHash);
        
        return validCount;
    }
    
    /**
     * @dev Get primary tranche for operator based on highest voting power
     */
    function _getPrimaryTranche(address operator) internal view returns (VotingPowerProvider.TrancheType) {
        uint256 seniorPower = votingPowerProvider.getTrancheVotingPower(operator, VotingPowerProvider.TrancheType.SENIOR);
        uint256 mezzaninePower = votingPowerProvider.getTrancheVotingPower(operator, VotingPowerProvider.TrancheType.MEZZANINE);
        uint256 juniorPower = votingPowerProvider.getTrancheVotingPower(operator, VotingPowerProvider.TrancheType.JUNIOR);
        
        if (seniorPower >= mezzaninePower && seniorPower >= juniorPower) {
            return VotingPowerProvider.TrancheType.SENIOR;
        } else if (mezzaninePower >= juniorPower) {
            return VotingPowerProvider.TrancheType.MEZZANINE;
        } else {
            return VotingPowerProvider.TrancheType.JUNIOR;
        }
    }
    
    /**
     * @dev Sort validators by voting power (bubble sort for simplicity)
     */
    function _sortValidatorsByPower(ValidatorInfo[] memory validators, uint256 length) internal pure {
        for (uint i = 0; i < length - 1; i++) {
            for (uint j = 0; j < length - i - 1; j++) {
                if (validators[j].votingPower < validators[j + 1].votingPower) {
                    ValidatorInfo memory temp = validators[j];
                    validators[j] = validators[j + 1];
                    validators[j + 1] = temp;
                }
            }
        }
    }
    
    /**
     * @dev Generate hash for validator set verification
     */
    function _generateSetHash(uint256 epoch) internal view returns (bytes32) {
        ValidatorSet storage valSet = validatorSets[epoch];
        bytes memory data;
        
        // Include epoch and basic info
        data = abi.encodePacked(epoch, valSet.totalVotingPower, valSet.validatorCount);
        
        // Include each validator's info
        for (uint i = 0; i < valSet.validatorAddresses.length; i++) {
            address operator = valSet.validatorAddresses[i];
            ValidatorInfo storage validator = valSet.validators[operator];
            
            data = abi.encodePacked(
                data,
                operator,
                validator.votingPower,
                validator.blsPubkey[0],
                validator.blsPubkey[1]
            );
        }
        
        return keccak256(data);
    }
    
    /**
     * @dev Update epoch metrics
     */
    function _updateEpochMetrics(uint256 epoch) internal {
        ValidatorSet storage valSet = validatorSets[epoch];
        EpochMetrics storage metrics = epochMetrics[epoch];
        
        metrics.totalValidators = valSet.validatorCount;
        metrics.totalStaked = valSet.totalVotingPower;
        metrics.consensusThreshold = valSet.threshold;
        
        if (valSet.validatorCount > 0) {
            metrics.averageVotingPower = valSet.totalVotingPower / valSet.validatorCount;
            
            // Count by tranche and find top validator
            uint256 topPower = 0;
            for (uint i = 0; i < valSet.validatorAddresses.length; i++) {
                address operator = valSet.validatorAddresses[i];
                ValidatorInfo storage validator = valSet.validators[operator];
                
                // Count by tranche
                if (validator.primaryTranche == VotingPowerProvider.TrancheType.SENIOR) {
                    metrics.seniorValidators++;
                } else if (validator.primaryTranche == VotingPowerProvider.TrancheType.MEZZANINE) {
                    metrics.mezzanineValidators++;
                } else {
                    metrics.juniorValidators++;
                }
                
                // Track top power
                if (validator.votingPower > topPower) {
                    topPower = validator.votingPower;
                }
            }
            
            metrics.topValidatorPower = topPower;
        }
    }
    
    // =====================================================
    // EPOCH MANAGEMENT
    // =====================================================
    
    /**
     * @dev Finalize validator set for epoch
     */
    function finalizeValidatorSet(uint256 epoch) 
        external 
        onlyOwner 
        validEpoch(epoch)
        onlyUnfinalized(epoch) 
    {
        _finalizeValidatorSet(epoch);
    }
    
    /**
     * @dev Internal finalization
     */
    function _finalizeValidatorSet(uint256 epoch) internal {
        ValidatorSet storage valSet = validatorSets[epoch];
        require(valSet.validatorCount > 0, "No validators in set");
        
        valSet.isFinalized = true;
        valSet.finalizedBlock = block.number;
        
        if (epoch > latestFinalizedEpoch) {
            latestFinalizedEpoch = epoch;
        }
        
        emit ValidatorSetFinalized(epoch, block.number, valSet.threshold);
    }
    
    /**
     * @dev Advance to next epoch
     */
    function advanceEpoch() external {
        uint256 oldEpoch = currentEpoch;
        currentEpoch++;
        
        // Auto-generate validator set for new epoch if enabled
        if (autoFinalization) {
            _generateValidatorSet(currentEpoch);
        }
        
        emit EpochAdvanced(oldEpoch, currentEpoch);
    }
    
    // =====================================================
    // PERFORMANCE TRACKING
    // =====================================================
    
    /**
     * @dev Update validator performance (called by other contracts)
     */
    function updateValidatorPerformance(
        address operator, 
        uint256 newScore
    ) external onlyOwner {
        require(newScore <= 10000, "Score cannot exceed 100%");
        validatorPerformance[operator] = newScore;
        emit PerformanceUpdated(operator, newScore);
    }
    
    /**
     * @dev Mark validator participation for epoch
     */
    function markValidatorParticipation(
        uint256 epoch,
        address operator,
        bool participated
    ) external onlyOwner validEpoch(epoch) {
        epochParticipation[epoch][operator] = participated;
    }
    
    // =====================================================
    // ADMIN FUNCTIONS
    // =====================================================
    
    /**
     * @dev Update configuration parameters
     */
    function updateConfiguration(
        uint256 newMinVotingPower,
        uint256 newMaxValidators,
        uint256 newConsensusThreshold,
        bool newAutoFinalization
    ) external onlyOwner {
        require(newMaxValidators >= 1 && newMaxValidators <= 1000, "Invalid max validators");
        require(newConsensusThreshold >= 5000 && newConsensusThreshold <= 9000, "Invalid threshold");
        
        minVotingPower = newMinVotingPower;
        maxValidators = newMaxValidators;
        consensusThreshold = newConsensusThreshold;
        autoFinalization = newAutoFinalization;
        
        emit ConfigurationUpdated("minVotingPower", newMinVotingPower);
        emit ConfigurationUpdated("maxValidators", newMaxValidators);
        emit ConfigurationUpdated("consensusThreshold", newConsensusThreshold);
    }
    
    /**
     * @dev Emergency remove validator from epoch
     */
    function removeValidatorFromEpoch(
        uint256 epoch,
        address operator,
        string calldata reason
    ) external onlyOwner validEpoch(epoch) onlyUnfinalized(epoch) {
        ValidatorSet storage valSet = validatorSets[epoch];
        require(valSet.validators[operator].isActive, "Validator not active");
        
        // Mark as inactive
        valSet.validators[operator].isActive = false;
        valSet.totalVotingPower -= valSet.validators[operator].votingPower;
        valSet.validatorCount--;
        
        // Remove from addresses array
        for (uint i = 0; i < valSet.validatorAddresses.length; i++) {
            if (valSet.validatorAddresses[i] == operator) {
                valSet.validatorAddresses[i] = valSet.validatorAddresses[valSet.validatorAddresses.length - 1];
                valSet.validatorAddresses.pop();
                break;
            }
        }
        
        // Update threshold
        valSet.threshold = (valSet.totalVotingPower * consensusThreshold) / 10000;
        
        // Regenerate set hash
        valSet.setHash = _generateSetHash(epoch);
        
        emit ValidatorRemoved(epoch, operator, reason);
    }
    
    // =====================================================
    // VIEW FUNCTIONS
    // =====================================================
    
    /**
     * @dev Get validator set info for epoch
     */
    function getValidatorSet(uint256 epoch) external view validEpoch(epoch) returns (
        uint256 totalVotingPower,
        uint256 validatorCount,
        bytes32 setHash,
        uint256 threshold,
        bool isFinalized,
        address[] memory validators
    ) {
        ValidatorSet storage valSet = validatorSets[epoch];
        return (
            valSet.totalVotingPower,
            valSet.validatorCount,
            valSet.setHash,
            valSet.threshold,
            valSet.isFinalized,
            valSet.validatorAddresses
        );
    }
    
    /**
     * @dev Get validator info for specific operator in epoch
     */
    function getValidatorInfo(uint256 epoch, address operator) 
        external 
        view 
        validEpoch(epoch) 
        returns (ValidatorInfo memory) 
    {
        return validatorSets[epoch].validators[operator];
    }
    
    /**
     * @dev Get epoch metrics
     */
    function getEpochMetrics(uint256 epoch) 
        external 
        view 
        validEpoch(epoch) 
        returns (EpochMetrics memory) 
    {
        return epochMetrics[epoch];
    }
    
    /**
     * @dev Get current epoch validator set
     */
    function getCurrentValidatorSet() external view returns (
        uint256 epoch,
        uint256 totalVotingPower,
        uint256 validatorCount,
        bytes32 setHash,
        bool isFinalized
    ) {
        ValidatorSet storage valSet = validatorSets[currentEpoch];
        return (
            currentEpoch,
            valSet.totalVotingPower,
            valSet.validatorCount,
            valSet.setHash,
            valSet.isFinalized
        );
    }
    
    /**
     * @dev Check if operator is validator in epoch
     */
    function isValidatorInEpoch(uint256 epoch, address operator) 
        external 
        view 
        validEpoch(epoch) 
        returns (bool) 
    {
        return validatorSets[epoch].validators[operator].isActive;
    }
    
    /**
     * @dev Get validator BLS keys for epoch (for Relay nodes)
     */
    function getValidatorBlsKeys(uint256 epoch) 
        external 
        view 
        validEpoch(epoch) 
        returns (
            address[] memory operators,
            uint256[2][] memory pubkeys,
            uint256[4][] memory pubkeysG2,
            uint256[] memory votingPowers
        ) 
    {
        ValidatorSet storage valSet = validatorSets[epoch];
        uint256 count = valSet.validatorCount;
        
        operators = new address[](count);
        pubkeys = new uint256[2][](count);
        pubkeysG2 = new uint256[4][](count);
        votingPowers = new uint256[](count);
        
        for (uint i = 0; i < count; i++) {
            address operator = valSet.validatorAddresses[i];
            ValidatorInfo storage validator = valSet.validators[operator];
            
            operators[i] = operator;
            pubkeys[i] = validator.blsPubkey;
            pubkeysG2[i] = validator.blsPubkeyG2;
            votingPowers[i] = validator.votingPower;
        }
    }
    
    /**
     * @dev Get configuration
     */
    function getConfiguration() external view returns (
        uint256 minVotingPower_,
        uint256 maxValidators_,
        uint256 consensusThreshold_,
        bool autoFinalization_
    ) {
        return (minVotingPower, maxValidators, consensusThreshold, autoFinalization);
    }
}