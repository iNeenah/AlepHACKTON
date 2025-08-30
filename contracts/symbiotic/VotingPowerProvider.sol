// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title VotingPowerProvider
 * @dev Derives voting power from Symbiotic vault stakes with tranche-based weighting
 * This contract integrates with VaultFactory and OperatorRegistry for multi-asset staking
 */
contract VotingPowerProvider is Ownable, ReentrancyGuard {
    
    // =====================================================
    // STRUCTS & ENUMS
    // =====================================================
    
    enum TrancheType { SENIOR, MEZZANINE, JUNIOR }
    
    struct VaultInfo {
        address vaultAddress;
        uint256 totalStaked;
        uint256 weight;           // Voting power multiplier (100 = 1x, 150 = 1.5x)
        bool isActive;
        TrancheType trancheType;
        uint256 slashingBuffer;   // Amount reserved for potential slashing
    }
    
    struct OperatorStake {
        uint256 totalPower;
        mapping(address => uint256) vaultStakes;  // vault => staked amount
        mapping(TrancheType => uint256) tranchePower; // tranche => voting power
        bool isRegistered;
        uint256 lastUpdateEpoch;
    }
    
    struct EpochInfo {
        uint256 startBlock;
        uint256 endBlock;
        uint256 totalVotingPower;
        mapping(TrancheType => uint256) trancheTotalPower;
        bool finalized;
    }
    
    // =====================================================
    // STATE VARIABLES
    // =====================================================
    
    // Core state
    uint256 public currentEpoch;
    uint256 public epochDuration = 50400; // ~7 days in blocks (12s blocks)
    
    // Mappings
    mapping(address => VaultInfo) public vaults;
    mapping(address => OperatorStake) public operatorStakes;
    mapping(uint256 => EpochInfo) public epochs;
    
    // Arrays for iteration
    address[] public registeredVaults;
    address[] public registeredOperators;
    
    // Tranche weights (out of 10000 for precision)
    mapping(TrancheType => uint256) public trancheWeights;
    
    // Constants
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MIN_STAKE = 1 ether;
    uint256 public constant MAX_VAULTS = 50;
    
    // =====================================================
    // EVENTS
    // =====================================================
    
    event VaultRegistered(address indexed vault, TrancheType trancheType, uint256 weight);
    event VaultUpdated(address indexed vault, uint256 newWeight, bool isActive);
    event OperatorRegistered(address indexed operator);
    event StakeDeposited(address indexed operator, address indexed vault, uint256 amount);
    event StakeWithdrawn(address indexed operator, address indexed vault, uint256 amount);
    event EpochFinalized(uint256 indexed epoch, uint256 totalVotingPower);
    event TrancheWeightUpdated(TrancheType tranche, uint256 newWeight);
    event SlashingExecuted(address indexed operator, address indexed vault, uint256 amount);
    
    // =====================================================
    // MODIFIERS
    // =====================================================
    
    modifier onlyRegisteredOperator() {
        require(operatorStakes[msg.sender].isRegistered, "Operator not registered");
        _;
    }
    
    modifier onlyActiveVault(address vault) {
        require(vaults[vault].isActive, "Vault not active");
        _;
    }
    
    modifier epochNotFinalized(uint256 epoch) {
        require(!epochs[epoch].finalized, "Epoch already finalized");
        _;
    }
    
    // =====================================================
    // CONSTRUCTOR
    // =====================================================
    
    constructor() {
        // Initialize first epoch
        currentEpoch = 1;
        epochs[currentEpoch].startBlock = block.number;
        epochs[currentEpoch].endBlock = block.number + epochDuration;
        
        // Set default tranche weights
        trancheWeights[TrancheType.SENIOR] = 8000;      // 80% - Lower risk, stable returns
        trancheWeights[TrancheType.MEZZANINE] = 6000;   // 60% - Medium risk
        trancheWeights[TrancheType.JUNIOR] = 4000;      // 40% - Higher risk, higher yield
    }
    
    // =====================================================
    // VAULT MANAGEMENT
    // =====================================================
    
    /**
     * @dev Register a new vault for voting power derivation
     */
    function registerVault(
        address vaultAddress,
        uint256 weight,
        TrancheType trancheType
    ) external onlyOwner {
        require(vaultAddress != address(0), "Invalid vault address");
        require(weight > 0 && weight <= 300, "Weight must be 1-300 (0.01x-3x)");
        require(registeredVaults.length < MAX_VAULTS, "Maximum vaults reached");
        require(!vaults[vaultAddress].isActive, "Vault already registered");
        
        vaults[vaultAddress] = VaultInfo({
            vaultAddress: vaultAddress,
            totalStaked: 0,
            weight: weight,
            isActive: true,
            trancheType: trancheType,
            slashingBuffer: 0
        });
        
        registeredVaults.push(vaultAddress);
        
        emit VaultRegistered(vaultAddress, trancheType, weight);
    }
    
    /**
     * @dev Update vault parameters
     */
    function updateVault(
        address vaultAddress,
        uint256 newWeight,
        bool isActive
    ) external onlyOwner {
        require(vaults[vaultAddress].vaultAddress != address(0), "Vault not found");
        require(newWeight > 0 && newWeight <= 300, "Weight must be 1-300");
        
        vaults[vaultAddress].weight = newWeight;
        vaults[vaultAddress].isActive = isActive;
        
        emit VaultUpdated(vaultAddress, newWeight, isActive);
    }
    
    // =====================================================
    // OPERATOR MANAGEMENT
    // =====================================================
    
    /**
     * @dev Register as an operator
     */
    function registerOperator() external {
        require(!operatorStakes[msg.sender].isRegistered, "Already registered");
        
        operatorStakes[msg.sender].isRegistered = true;
        operatorStakes[msg.sender].lastUpdateEpoch = currentEpoch;
        registeredOperators.push(msg.sender);
        
        emit OperatorRegistered(msg.sender);
    }
    
    // =====================================================
    // STAKING FUNCTIONS
    // =====================================================
    
    /**
     * @dev Deposit stake into a vault (simulated for demo)
     */
    function depositStake(
        address vault,
        uint256 amount
    ) external onlyRegisteredOperator onlyActiveVault(vault) nonReentrant {
        require(amount >= MIN_STAKE, "Amount below minimum stake");
        
        // Update operator stake
        operatorStakes[msg.sender].vaultStakes[vault] += amount;
        operatorStakes[msg.sender].lastUpdateEpoch = currentEpoch;
        
        // Update vault total
        vaults[vault].totalStaked += amount;
        
        // Recalculate voting power
        _updateOperatorVotingPower(msg.sender);
        
        emit StakeDeposited(msg.sender, vault, amount);
    }
    
    /**
     * @dev Withdraw stake from vault
     */
    function withdrawStake(
        address vault,
        uint256 amount
    ) external onlyRegisteredOperator nonReentrant {
        require(operatorStakes[msg.sender].vaultStakes[vault] >= amount, "Insufficient stake");
        
        // Update operator stake
        operatorStakes[msg.sender].vaultStakes[vault] -= amount;
        operatorStakes[msg.sender].lastUpdateEpoch = currentEpoch;
        
        // Update vault total
        vaults[vault].totalStaked -= amount;
        
        // Recalculate voting power
        _updateOperatorVotingPower(msg.sender);
        
        emit StakeWithdrawn(msg.sender, vault, amount);
    }
    
    // =====================================================
    // VOTING POWER CALCULATION
    // =====================================================
    
    /**
     * @dev Calculate total voting power for an operator
     */
    function _updateOperatorVotingPower(address operator) internal {
        uint256 totalPower = 0;
        
        // Reset tranche powers
        operatorStakes[operator].tranchePower[TrancheType.SENIOR] = 0;
        operatorStakes[operator].tranchePower[TrancheType.MEZZANINE] = 0;
        operatorStakes[operator].tranchePower[TrancheType.JUNIOR] = 0;
        
        // Calculate power from each vault
        for (uint256 i = 0; i < registeredVaults.length; i++) {
            address vault = registeredVaults[i];
            if (!vaults[vault].isActive) continue;
            
            uint256 staked = operatorStakes[operator].vaultStakes[vault];
            if (staked == 0) continue;
            
            // Apply vault weight and tranche weight
            uint256 vaultPower = (staked * vaults[vault].weight) / 100;
            uint256 trancheWeight = trancheWeights[vaults[vault].trancheType];
            uint256 finalPower = (vaultPower * trancheWeight) / BASIS_POINTS;
            
            totalPower += finalPower;
            operatorStakes[operator].tranchePower[vaults[vault].trancheType] += finalPower;
        }
        
        operatorStakes[operator].totalPower = totalPower;
    }
    
    /**
     * @dev Get voting power for operator at specific epoch
     */
    function getVotingPower(address operator, uint256 epoch) external view returns (uint256) {
        if (epoch > currentEpoch) return 0;
        if (!operatorStakes[operator].isRegistered) return 0;
        
        return operatorStakes[operator].totalPower;
    }
    
    /**
     * @dev Get tranche-specific voting power
     */
    function getTrancheVotingPower(
        address operator, 
        TrancheType tranche
    ) external view returns (uint256) {
        return operatorStakes[operator].tranchePower[tranche];
    }
    
    // =====================================================
    // EPOCH MANAGEMENT
    // =====================================================
    
    /**
     * @dev Advance to next epoch
     */
    function advanceEpoch() external {
        require(block.number >= epochs[currentEpoch].endBlock, "Current epoch not finished");
        
        // Finalize current epoch
        _finalizeEpoch(currentEpoch);
        
        // Start new epoch
        currentEpoch++;
        epochs[currentEpoch].startBlock = block.number;
        epochs[currentEpoch].endBlock = block.number + epochDuration;
    }
    
    /**
     * @dev Finalize epoch and calculate total voting power
     */
    function _finalizeEpoch(uint256 epoch) internal epochNotFinalized(epoch) {
        uint256 totalPower = 0;
        uint256[3] memory trancheTotals; // [SENIOR, MEZZANINE, JUNIOR]
        
        // Sum up all operator voting powers
        for (uint256 i = 0; i < registeredOperators.length; i++) {
            address operator = registeredOperators[i];
            totalPower += operatorStakes[operator].totalPower;
            
            trancheTotals[0] += operatorStakes[operator].tranchePower[TrancheType.SENIOR];
            trancheTotals[1] += operatorStakes[operator].tranchePower[TrancheType.MEZZANINE];
            trancheTotals[2] += operatorStakes[operator].tranchePower[TrancheType.JUNIOR];
        }
        
        epochs[epoch].totalVotingPower = totalPower;
        epochs[epoch].trancheTotalPower[TrancheType.SENIOR] = trancheTotals[0];
        epochs[epoch].trancheTotalPower[TrancheType.MEZZANINE] = trancheTotals[1];
        epochs[epoch].trancheTotalPower[TrancheType.JUNIOR] = trancheTotals[2];
        epochs[epoch].finalized = true;
        
        emit EpochFinalized(epoch, totalPower);
    }
    
    // =====================================================
    // ADMIN FUNCTIONS
    // =====================================================
    
    /**
     * @dev Update tranche weights
     */
    function updateTrancheWeight(
        TrancheType tranche, 
        uint256 newWeight
    ) external onlyOwner {
        require(newWeight <= BASIS_POINTS, "Weight cannot exceed 100%");
        
        trancheWeights[tranche] = newWeight;
        
        // Recalculate all operator powers
        _recalculateAllVotingPowers();
        
        emit TrancheWeightUpdated(tranche, newWeight);
    }
    
    /**
     * @dev Update epoch duration
     */
    function updateEpochDuration(uint256 newDuration) external onlyOwner {
        require(newDuration >= 100 && newDuration <= 201600, "Duration must be 100-201600 blocks");
        epochDuration = newDuration;
    }
    
    /**
     * @dev Recalculate voting powers for all operators
     */
    function _recalculateAllVotingPowers() internal {
        for (uint256 i = 0; i < registeredOperators.length; i++) {
            _updateOperatorVotingPower(registeredOperators[i]);
        }
    }
    
    // =====================================================
    // SLASHING FUNCTIONS
    // =====================================================
    
    /**
     * @dev Execute slashing on operator's stake
     */
    function slash(
        address operator,
        address vault,
        uint256 amount
    ) external onlyOwner {
        require(operatorStakes[operator].vaultStakes[vault] >= amount, "Insufficient stake to slash");
        
        operatorStakes[operator].vaultStakes[vault] -= amount;
        vaults[vault].totalStaked -= amount;
        vaults[vault].slashingBuffer += amount;
        
        _updateOperatorVotingPower(operator);
        
        emit SlashingExecuted(operator, vault, amount);
    }
    
    // =====================================================
    // VIEW FUNCTIONS
    // =====================================================
    
    /**
     * @dev Get current epoch info
     */
    function getCurrentEpochInfo() external view returns (
        uint256 epoch,
        uint256 startBlock,
        uint256 endBlock,
        uint256 totalVotingPower
    ) {
        return (
            currentEpoch,
            epochs[currentEpoch].startBlock,
            epochs[currentEpoch].endBlock,
            epochs[currentEpoch].totalVotingPower
        );
    }
    
    /**
     * @dev Get operator stake in specific vault
     */
    function getOperatorVaultStake(
        address operator, 
        address vault
    ) external view returns (uint256) {
        return operatorStakes[operator].vaultStakes[vault];
    }
    
    /**
     * @dev Get all registered vaults
     */
    function getAllVaults() external view returns (address[] memory) {
        return registeredVaults;
    }
    
    /**
     * @dev Get all registered operators
     */
    function getAllOperators() external view returns (address[] memory) {
        return registeredOperators;
    }
    
    /**
     * @dev Get vault details
     */
    function getVaultInfo(address vault) external view returns (
        uint256 totalStaked,
        uint256 weight,
        bool isActive,
        TrancheType trancheType,
        uint256 slashingBuffer
    ) {
        VaultInfo memory info = vaults[vault];
        return (
            info.totalStaked,
            info.weight,
            info.isActive,
            info.trancheType,
            info.slashingBuffer
        );
    }
}