// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ValSetDriver.sol";

/**
 * @title Settlement
 * @dev Per-chain verifier contract that commits compressed validator-set headers 
 * and verifies aggregated signatures using BLS BN254 for Symbiotic network
 */
contract Settlement is Ownable, ReentrancyGuard {
    
    // =====================================================
    // STRUCTS & ENUMS
    // =====================================================
    
    enum VerificationMode { SIMPLE, ZK_PROOF }
    
    struct ValidatorSetHeader {
        uint256 epoch;
        bytes32 setHash;              // Hash from ValSetDriver
        uint256 totalVotingPower;
        uint256 validatorCount;
        uint256 threshold;            // Minimum power needed for consensus
        uint256 commitBlock;
        bool isCommitted;
        address committer;            // Address that committed this header
    }
    
    struct BlsSignature {
        uint256[2] signature;         // BLS signature point in G1
        uint256[4] pubkeyAgg;        // Aggregated public key in G2
        uint256 votingPowerSigned;   // Total voting power of signers
        bytes32 messageHash;         // Hash of the message being signed
    }
    
    struct VerificationResult {
        bool isValid;
        uint256 votingPowerVerified;
        uint256 signerCount;
        uint256 verificationBlock;
        bytes32 messageHash;
        VerificationMode mode;
    }
    
    struct ZkProof {
        uint256[8] proof;            // ZK-SNARK proof elements
        uint256[] publicInputs;      // Public inputs for verification
    }
    
    // =====================================================
    // STATE VARIABLES
    // =====================================================
    
    // Core contracts
    ValSetDriver public immutable valSetDriver;
    
    // Validator set headers
    mapping(uint256 => ValidatorSetHeader) public validatorSetHeaders;
    mapping(bytes32 => bool) public committedHashes;
    
    // Verification tracking
    mapping(bytes32 => VerificationResult) public verificationResults;
    mapping(bytes32 => mapping(address => bool)) public hasVerified;
    
    // Configuration
    VerificationMode public defaultMode = VerificationMode.SIMPLE;
    uint256 public maxValidatorsSimple = 125;     // Limit for simple BLS verification
    uint256 public minConfirmations = 1;          // Minimum confirmations needed
    bool public requireCommittedSet = true;      // Require validator set to be committed
    
    // ZK Verifier contract (for large validator sets)
    address public zkVerifierContract;
    
    // Performance metrics
    uint256 public totalVerifications;
    uint256 public successfulVerifications;
    mapping(address => uint256) public verifierActivity;
    
    // =====================================================
    // EVENTS
    // =====================================================
    
    event ValidatorSetCommitted(
        uint256 indexed epoch,
        bytes32 indexed setHash,
        uint256 totalVotingPower,
        uint256 validatorCount,
        address committer
    );
    
    event SignatureVerified(
        bytes32 indexed messageHash,
        uint256 votingPowerVerified,
        uint256 signerCount,
        VerificationMode mode,
        address verifier
    );
    
    event SignatureVerificationFailed(
        bytes32 indexed messageHash,
        string reason,
        address verifier
    );
    
    event ZkVerifierUpdated(address oldVerifier, address newVerifier);
    event ConfigurationUpdated(string parameter, uint256 newValue);
    event ModeUpdated(VerificationMode newMode);
    
    // =====================================================
    // MODIFIERS
    // =====================================================
    
    modifier validEpoch(uint256 epoch) {
        require(epoch > 0, "Invalid epoch");
        _;
    }
    
    modifier committedEpoch(uint256 epoch) {
        if (requireCommittedSet) {
            require(validatorSetHeaders[epoch].isCommitted, "Validator set not committed");
        }
        _;
    }
    
    modifier onlyCommitter() {
        // In practice, this would be restricted to authorized Relay committers
        _;
    }
    
    // =====================================================
    // CONSTRUCTOR
    // =====================================================
    
    constructor(address _valSetDriver, address initialOwner) Ownable(initialOwner) {
        require(_valSetDriver != address(0), "Invalid ValSetDriver address");
        valSetDriver = ValSetDriver(_valSetDriver);
    }
    
    // =====================================================
    // VALIDATOR SET COMMITMENT
    // =====================================================
    
    /**
     * @dev Commit validator set header from ValSetDriver
     * Called by Relay committer nodes
     */
    function commitValidatorSetHeader(uint256 epoch) 
        external 
        onlyCommitter 
        validEpoch(epoch) 
        nonReentrant 
    {
        require(!validatorSetHeaders[epoch].isCommitted, "Header already committed");
        
        // Get validator set info from ValSetDriver
        (
            uint256 totalVotingPower,
            uint256 validatorCount,
            bytes32 setHash,
            uint256 threshold,
            bool isFinalized,
        ) = valSetDriver.getValidatorSet(epoch);
        
        require(isFinalized, "Validator set not finalized");
        require(validatorCount > 0, "Empty validator set");
        
        // Store header
        validatorSetHeaders[epoch] = ValidatorSetHeader({
            epoch: epoch,
            setHash: setHash,
            totalVotingPower: totalVotingPower,
            validatorCount: validatorCount,
            threshold: threshold,
            commitBlock: block.number,
            isCommitted: true,
            committer: msg.sender
        });
        
        committedHashes[setHash] = true;
        
        emit ValidatorSetCommitted(epoch, setHash, totalVotingPower, validatorCount, msg.sender);
    }
    
    // =====================================================
    // SIGNATURE VERIFICATION
    // =====================================================
    
    /**
     * @dev Verify BLS signature with simple linear verification
     * Used for smaller validator sets (≤125 validators)
     */
    function verifySignatureSimple(
        uint256 epoch,
        bytes32 messageHash,
        BlsSignature calldata signature,
        address[] calldata signers,
        uint256[] calldata signerVotingPowers
    ) external committedEpoch(epoch) returns (bool) {
        require(signers.length == signerVotingPowers.length, "Mismatched arrays");
        require(signers.length <= maxValidatorsSimple, "Too many signers for simple mode");
        
        ValidatorSetHeader memory header = validatorSetHeaders[epoch];
        require(signature.messageHash == messageHash, "Message hash mismatch");
        
        // Verify signers are valid validators and calculate total power
        uint256 totalSignerPower = 0;
        for (uint i = 0; i < signers.length; i++) {
            require(valSetDriver.isValidatorInEpoch(epoch, signers[i]), "Invalid signer");
            totalSignerPower += signerVotingPowers[i];
        }
        
        require(totalSignerPower >= header.threshold, "Insufficient voting power");
        require(totalSignerPower == signature.votingPowerSigned, "Power mismatch");
        
        // Perform BLS signature verification (simplified for demo)
        bool isValid = _verifyBlsSignatureSimple(signature, signers, messageHash);
        
        // Record verification result
        _recordVerificationResult(messageHash, isValid, totalSignerPower, signers.length, VerificationMode.SIMPLE);
        
        if (isValid) {
            emit SignatureVerified(messageHash, totalSignerPower, signers.length, VerificationMode.SIMPLE, msg.sender);
        } else {
            emit SignatureVerificationFailed(messageHash, "BLS verification failed", msg.sender);
        }
        
        return isValid;
    }
    
    /**
     * @dev Verify BLS signature with ZK proof
     * Used for larger validator sets (>125 validators)
     */
    function verifySignatureZk(
        uint256 epoch,
        bytes32 messageHash,
        BlsSignature calldata signature,
        ZkProof calldata zkProof
    ) external committedEpoch(epoch) returns (bool) {
        require(zkVerifierContract != address(0), "ZK verifier not set");
        
        ValidatorSetHeader memory header = validatorSetHeaders[epoch];
        require(signature.messageHash == messageHash, "Message hash mismatch");
        require(signature.votingPowerSigned >= header.threshold, "Insufficient voting power");
        
        // Verify ZK proof
        bool isValid = _verifyZkProof(zkProof, signature, messageHash, epoch);
        
        // Record verification result  
        _recordVerificationResult(
            messageHash, 
            isValid, 
            signature.votingPowerSigned, 
            0, // Signer count not available in ZK mode
            VerificationMode.ZK_PROOF
        );
        
        if (isValid) {
            emit SignatureVerified(messageHash, signature.votingPowerSigned, 0, VerificationMode.ZK_PROOF, msg.sender);
        } else {
            emit SignatureVerificationFailed(messageHash, "ZK proof verification failed", msg.sender);
        }
        
        return isValid;
    }
    
    /**
     * @dev Main verification function that automatically chooses mode
     */
    function verifySignature(
        uint256 epoch,
        bytes32 messageHash,
        BlsSignature calldata signature,
        address[] calldata signers,
        uint256[] calldata signerVotingPowers,
        ZkProof calldata zkProof
    ) external returns (bool) {
        ValidatorSetHeader memory header = validatorSetHeaders[epoch];
        
        // Choose verification mode based on validator count
        if (header.validatorCount <= maxValidatorsSimple && signers.length > 0) {
            return this.verifySignatureSimple(epoch, messageHash, signature, signers, signerVotingPowers);
        } else {
            return this.verifySignatureZk(epoch, messageHash, signature, zkProof);
        }
    }
    
    // =====================================================
    // INTERNAL VERIFICATION FUNCTIONS
    // =====================================================
    
    /**
     * @dev Internal BLS signature verification (simplified for demo)
     * In production, this would use proper BLS pairing checks
     */
    function _verifyBlsSignatureSimple(
        BlsSignature calldata signature,
        address[] calldata signers,
        bytes32 messageHash
    ) internal view returns (bool) {
        // SIMPLIFIED VERIFICATION FOR DEMO
        // In production, this would involve:
        // 1. Aggregate public keys of signers
        // 2. Verify pairing equation: e(signature, G2) == e(H(message), aggPubkey)
        
        // Basic checks
        if (signature.signature[0] == 0 && signature.signature[1] == 0) return false;
        if (signers.length == 0) return false;
        
        // Simulate BLS verification success based on basic criteria
        // This is a placeholder - real implementation would use BLS pairing
        return true;
    }
    
    /**
     * @dev Internal ZK proof verification
     */
    function _verifyZkProof(
        ZkProof calldata zkProof,
        BlsSignature calldata signature,
        bytes32 messageHash,
        uint256 epoch
    ) internal view returns (bool) {
        require(zkVerifierContract != address(0), "ZK verifier not set");
        
        // SIMPLIFIED ZK VERIFICATION FOR DEMO
        // In production, this would call the ZK verifier contract:
        // return IZkVerifier(zkVerifierContract).verifyProof(zkProof.proof, zkProof.publicInputs);
        
        // Basic validation
        if (zkProof.proof.length != 8) return false;
        if (zkProof.publicInputs.length == 0) return false;
        
        // Simulate ZK verification
        return true;
    }
    
    /**
     * @dev Record verification result
     */
    function _recordVerificationResult(
        bytes32 messageHash,
        bool isValid,
        uint256 votingPowerVerified,
        uint256 signerCount,
        VerificationMode mode
    ) internal {
        verificationResults[messageHash] = VerificationResult({
            isValid: isValid,
            votingPowerVerified: votingPowerVerified,
            signerCount: signerCount,
            verificationBlock: block.number,
            messageHash: messageHash,
            mode: mode
        });
        
        hasVerified[messageHash][msg.sender] = true;
        verifierActivity[msg.sender]++;
        totalVerifications++;
        
        if (isValid) {
            successfulVerifications++;
        }
    }
    
    // =====================================================
    // ADMIN FUNCTIONS
    // =====================================================
    
    /**
     * @dev Set ZK verifier contract
     */
    function setZkVerifierContract(address newVerifier) external onlyOwner {
        address oldVerifier = zkVerifierContract;
        zkVerifierContract = newVerifier;
        emit ZkVerifierUpdated(oldVerifier, newVerifier);
    }
    
    /**
     * @dev Update configuration
     */
    function updateConfiguration(
        uint256 newMaxValidatorsSimple,
        uint256 newMinConfirmations,
        bool newRequireCommittedSet
    ) external onlyOwner {
        require(newMaxValidatorsSimple >= 1 && newMaxValidatorsSimple <= 1000, "Invalid max validators");
        require(newMinConfirmations >= 1, "Invalid min confirmations");
        
        maxValidatorsSimple = newMaxValidatorsSimple;
        minConfirmations = newMinConfirmations;
        requireCommittedSet = newRequireCommittedSet;
        
        emit ConfigurationUpdated("maxValidatorsSimple", newMaxValidatorsSimple);
        emit ConfigurationUpdated("minConfirmations", newMinConfirmations);
    }
    
    /**
     * @dev Set default verification mode
     */
    function setDefaultMode(VerificationMode newMode) external onlyOwner {
        defaultMode = newMode;
        emit ModeUpdated(newMode);
    }
    
    /**
     * @dev Emergency function to commit validator set header (owner only)
     */
    function emergencyCommitHeader(
        uint256 epoch,
        bytes32 setHash,
        uint256 totalVotingPower,
        uint256 validatorCount,
        uint256 threshold
    ) external onlyOwner {
        require(!validatorSetHeaders[epoch].isCommitted, "Header already committed");
        
        validatorSetHeaders[epoch] = ValidatorSetHeader({
            epoch: epoch,
            setHash: setHash,
            totalVotingPower: totalVotingPower,
            validatorCount: validatorCount,
            threshold: threshold,
            commitBlock: block.number,
            isCommitted: true,
            committer: msg.sender
        });
        
        committedHashes[setHash] = true;
        
        emit ValidatorSetCommitted(epoch, setHash, totalVotingPower, validatorCount, msg.sender);
    }
    
    // =====================================================
    // VIEW FUNCTIONS
    // =====================================================
    
    /**
     * @dev Check if message has been verified
     */
    function isMessageVerified(bytes32 messageHash) external view returns (bool) {
        return verificationResults[messageHash].isValid;
    }
    
    /**
     * @dev Get verification result details
     */
    function getVerificationResult(bytes32 messageHash) 
        external 
        view 
        returns (VerificationResult memory) 
    {
        return verificationResults[messageHash];
    }
    
    /**
     * @dev Get validator set header for epoch
     */
    function getValidatorSetHeader(uint256 epoch) 
        external 
        view 
        returns (ValidatorSetHeader memory) 
    {
        return validatorSetHeaders[epoch];
    }
    
    /**
     * @dev Check if validator set is committed for epoch
     */
    function isValidatorSetCommitted(uint256 epoch) external view returns (bool) {
        return validatorSetHeaders[epoch].isCommitted;
    }
    
    /**
     * @dev Get verification statistics
     */
    function getVerificationStats() external view returns (
        uint256 total,
        uint256 successful,
        uint256 successRate,
        uint256 currentEpoch
    ) {
        uint256 rate = totalVerifications > 0 ? (successfulVerifications * 10000) / totalVerifications : 0;
        return (totalVerifications, successfulVerifications, rate, valSetDriver.currentEpoch());
    }
    
    /**
     * @dev Get verifier activity for address
     */
    function getVerifierActivity(address verifier) external view returns (uint256) {
        return verifierActivity[verifier];
    }
    
    /**
     * @dev Check if address has verified a specific message
     */
    function hasVerifiedMessage(bytes32 messageHash, address verifier) external view returns (bool) {
        return hasVerified[messageHash][verifier];
    }
    
    /**
     * @dev Get configuration
     */
    function getConfiguration() external view returns (
        VerificationMode defaultMode_,
        uint256 maxValidatorsSimple_,
        uint256 minConfirmations_,
        bool requireCommittedSet_,
        address zkVerifierContract_
    ) {
        return (defaultMode, maxValidatorsSimple, minConfirmations, requireCommittedSet, zkVerifierContract);
    }
    
    /**
     * @dev Estimate gas for verification
     */
    function estimateVerificationGas(
        uint256 signerCount,
        VerificationMode mode
    ) external pure returns (uint256) {
        if (mode == VerificationMode.SIMPLE) {
            // Linear cost based on signer count
            return 100000 + (signerCount * 15000);
        } else {
            // Fixed cost for ZK verification
            return 300000;
        }
    }
}