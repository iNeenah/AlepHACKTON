// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KeyRegistry
 * @dev Stores and manages operators' BLS BN254 and ECDSA keys for Symbiotic network
 * This contract is essential for the Relay SDK to verify signatures and manage validator sets
 */
contract KeyRegistry is Ownable, ReentrancyGuard {
    
    // =====================================================
    // STRUCTS & ENUMS
    // =====================================================
    
    enum KeyType { BLS_BN254, ECDSA }
    
    struct BlsKey {
        uint256[2] pubkey;        // BLS public key (2 field elements)
        uint256[4] pubkeyG2;      // BLS public key in G2 (4 field elements)
        bool isRegistered;
        uint256 registrationBlock;
        uint256 lastUsedEpoch;
    }
    
    struct EcdsaKey {
        address pubkey;           // ECDSA public key as address
        bool isRegistered;
        uint256 registrationBlock;
        uint256 lastUsedEpoch;
    }
    
    struct OperatorKeys {
        BlsKey blsKey;
        EcdsaKey ecdsaKey;
        bool hasBlsKey;
        bool hasEcdsaKey;
        uint256 totalKeysRegistered;
        string metadata;          // IPFS hash or JSON metadata
    }
    
    // =====================================================
    // STATE VARIABLES
    // =====================================================
    
    // Core mappings
    mapping(address => OperatorKeys) public operatorKeys;
    mapping(bytes32 => address) public blsKeyToOperator;     // BLS pubkey hash => operator
    mapping(address => address) public ecdsaKeyToOperator;   // ECDSA address => operator
    
    // Key tracking
    address[] public registeredOperators;
    mapping(uint256 => address[]) public epochOperators;     // epoch => operators active
    
    // Registry settings
    uint256 public currentEpoch;
    uint256 public maxOperators = 1000;
    bool public registrationOpen = true;
    
    // Key validation
    uint256 public constant BLS_FIELD_MODULUS = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    
    // =====================================================
    // EVENTS
    // =====================================================
    
    event BlsKeyRegistered(
        address indexed operator,
        uint256[2] pubkey,
        uint256[4] pubkeyG2,
        uint256 epoch
    );
    
    event EcdsaKeyRegistered(
        address indexed operator,
        address pubkey,
        uint256 epoch
    );
    
    event KeyUpdated(
        address indexed operator,
        KeyType keyType,
        uint256 epoch
    );
    
    event OperatorDeregistered(address indexed operator, uint256 epoch);
    event EpochAdvanced(uint256 oldEpoch, uint256 newEpoch);
    event RegistrationStatusChanged(bool isOpen);
    event MetadataUpdated(address indexed operator, string metadata);
    
    // =====================================================
    // MODIFIERS
    // =====================================================
    
    modifier onlyWhenRegistrationOpen() {
        require(registrationOpen, "Registration is closed");
        _;
    }
    
    modifier validOperator(address operator) {
        require(operator != address(0), "Invalid operator address");
        _;
    }
    
    modifier keyNotRegistered(address operator, KeyType keyType) {
        if (keyType == KeyType.BLS_BN254) {
            require(!operatorKeys[operator].hasBlsKey, "BLS key already registered");
        } else {
            require(!operatorKeys[operator].hasEcdsaKey, "ECDSA key already registered");
        }
        _;
    }
    
    // =====================================================
    // CONSTRUCTOR
    // =====================================================
    
    constructor(address initialOwner) Ownable(initialOwner) {
        currentEpoch = 1;
    }
    
    // =====================================================
    // BLS KEY REGISTRATION
    // =====================================================
    
    /**
     * @dev Register BLS BN254 key for operator
     * @param pubkey BLS public key in G1 (2 field elements)
     * @param pubkeyG2 BLS public key in G2 (4 field elements)
     * @param metadata Optional metadata (IPFS hash or JSON)
     */
    function registerBlsKey(
        uint256[2] calldata pubkey,
        uint256[4] calldata pubkeyG2,
        string calldata metadata
    ) external 
        onlyWhenRegistrationOpen 
        validOperator(msg.sender)
        keyNotRegistered(msg.sender, KeyType.BLS_BN254)
        nonReentrant 
    {
        require(registeredOperators.length < maxOperators, "Maximum operators reached");
        require(_isValidBlsKey(pubkey, pubkeyG2), "Invalid BLS key");
        
        bytes32 keyHash = keccak256(abi.encodePacked(pubkey[0], pubkey[1]));
        require(blsKeyToOperator[keyHash] == address(0), "BLS key already in use");
        
        // Store BLS key
        operatorKeys[msg.sender].blsKey = BlsKey({
            pubkey: pubkey,
            pubkeyG2: pubkeyG2,
            isRegistered: true,
            registrationBlock: block.number,
            lastUsedEpoch: currentEpoch
        });
        
        operatorKeys[msg.sender].hasBlsKey = true;
        operatorKeys[msg.sender].totalKeysRegistered++;
        operatorKeys[msg.sender].metadata = metadata;
        
        // Update mappings
        blsKeyToOperator[keyHash] = msg.sender;
        
        // Add to operators list if first key
        if (operatorKeys[msg.sender].totalKeysRegistered == 1) {
            registeredOperators.push(msg.sender);
        }
        
        // Add to current epoch
        epochOperators[currentEpoch].push(msg.sender);
        
        emit BlsKeyRegistered(msg.sender, pubkey, pubkeyG2, currentEpoch);
        
        if (bytes(metadata).length > 0) {
            emit MetadataUpdated(msg.sender, metadata);
        }
    }
    
    /**
     * @dev Validate BLS key format and field elements
     */
    function _isValidBlsKey(
        uint256[2] calldata pubkey,
        uint256[4] calldata pubkeyG2
    ) internal pure returns (bool) {
        // Check if all field elements are within the field modulus
        for (uint i = 0; i < 2; i++) {
            if (pubkey[i] >= BLS_FIELD_MODULUS) return false;
        }
        
        for (uint i = 0; i < 4; i++) {
            if (pubkeyG2[i] >= BLS_FIELD_MODULUS) return false;
        }
        
        // Check for zero keys
        if (pubkey[0] == 0 && pubkey[1] == 0) return false;
        if (pubkeyG2[0] == 0 && pubkeyG2[1] == 0 && pubkeyG2[2] == 0 && pubkeyG2[3] == 0) return false;
        
        return true;
    }
    
    // =====================================================
    // ECDSA KEY REGISTRATION
    // =====================================================
    
    /**
     * @dev Register ECDSA key for operator
     * @param pubkey ECDSA public key as Ethereum address
     * @param metadata Optional metadata
     */
    function registerEcdsaKey(
        address pubkey,
        string calldata metadata
    ) external 
        onlyWhenRegistrationOpen 
        validOperator(msg.sender)
        keyNotRegistered(msg.sender, KeyType.ECDSA)
        nonReentrant 
    {
        require(pubkey != address(0), "Invalid ECDSA key");
        require(ecdsaKeyToOperator[pubkey] == address(0), "ECDSA key already in use");
        
        // Store ECDSA key
        operatorKeys[msg.sender].ecdsaKey = EcdsaKey({
            pubkey: pubkey,
            isRegistered: true,
            registrationBlock: block.number,
            lastUsedEpoch: currentEpoch
        });
        
        operatorKeys[msg.sender].hasEcdsaKey = true;
        operatorKeys[msg.sender].totalKeysRegistered++;
        
        if (bytes(metadata).length > 0) {
            operatorKeys[msg.sender].metadata = metadata;
        }
        
        // Update mappings
        ecdsaKeyToOperator[pubkey] = msg.sender;
        
        // Add to operators list if first key
        if (operatorKeys[msg.sender].totalKeysRegistered == 1) {
            registeredOperators.push(msg.sender);
        }
        
        emit EcdsaKeyRegistered(msg.sender, pubkey, currentEpoch);
        
        if (bytes(metadata).length > 0) {
            emit MetadataUpdated(msg.sender, metadata);
        }
    }
    
    // =====================================================
    // KEY MANAGEMENT
    // =====================================================
    
    /**
     * @dev Update operator metadata
     */
    function updateMetadata(string calldata newMetadata) external {
        require(operatorKeys[msg.sender].totalKeysRegistered > 0, "No keys registered");
        
        operatorKeys[msg.sender].metadata = newMetadata;
        emit MetadataUpdated(msg.sender, newMetadata);
    }
    
    /**
     * @dev Deregister operator (admin only)
     */
    function deregisterOperator(address operator) external onlyOwner {
        require(operatorKeys[operator].totalKeysRegistered > 0, "Operator not registered");
        
        // Clear BLS key mapping
        if (operatorKeys[operator].hasBlsKey) {
            uint256[2] memory pubkey = operatorKeys[operator].blsKey.pubkey;
            bytes32 keyHash = keccak256(abi.encodePacked(pubkey[0], pubkey[1]));
            delete blsKeyToOperator[keyHash];
        }
        
        // Clear ECDSA key mapping
        if (operatorKeys[operator].hasEcdsaKey) {
            address ecdsaPubkey = operatorKeys[operator].ecdsaKey.pubkey;
            delete ecdsaKeyToOperator[ecdsaPubkey];
        }
        
        // Clear operator data
        delete operatorKeys[operator];
        
        // Remove from operators array (expensive but necessary)
        for (uint i = 0; i < registeredOperators.length; i++) {
            if (registeredOperators[i] == operator) {
                registeredOperators[i] = registeredOperators[registeredOperators.length - 1];
                registeredOperators.pop();
                break;
            }
        }
        
        emit OperatorDeregistered(operator, currentEpoch);
    }
    
    // =====================================================
    // EPOCH MANAGEMENT
    // =====================================================
    
    /**
     * @dev Advance to next epoch
     */
    function advanceEpoch() external onlyOwner {
        uint256 oldEpoch = currentEpoch;
        currentEpoch++;
        
        // Update last used epoch for all active operators
        for (uint i = 0; i < registeredOperators.length; i++) {
            address operator = registeredOperators[i];
            if (operatorKeys[operator].hasBlsKey) {
                operatorKeys[operator].blsKey.lastUsedEpoch = currentEpoch;
            }
            if (operatorKeys[operator].hasEcdsaKey) {
                operatorKeys[operator].ecdsaKey.lastUsedEpoch = currentEpoch;
            }
        }
        
        emit EpochAdvanced(oldEpoch, currentEpoch);
    }
    
    // =====================================================
    // ADMIN FUNCTIONS
    // =====================================================
    
    /**
     * @dev Toggle registration status
     */
    function setRegistrationStatus(bool isOpen) external onlyOwner {
        registrationOpen = isOpen;
        emit RegistrationStatusChanged(isOpen);
    }
    
    /**
     * @dev Update maximum operators
     */
    function setMaxOperators(uint256 newMax) external onlyOwner {
        require(newMax >= registeredOperators.length, "New max below current count");
        require(newMax <= 10000, "Max too high");
        maxOperators = newMax;
    }
    
    // =====================================================
    // VIEW FUNCTIONS
    // =====================================================
    
    /**
     * @dev Get operator's BLS key
     */
    function getBlsKey(address operator) external view returns (
        uint256[2] memory pubkey,
        uint256[4] memory pubkeyG2,
        bool isRegistered,
        uint256 registrationBlock,
        uint256 lastUsedEpoch
    ) {
        BlsKey memory key = operatorKeys[operator].blsKey;
        return (key.pubkey, key.pubkeyG2, key.isRegistered, key.registrationBlock, key.lastUsedEpoch);
    }
    
    /**
     * @dev Get operator's ECDSA key
     */
    function getEcdsaKey(address operator) external view returns (
        address pubkey,
        bool isRegistered,
        uint256 registrationBlock,
        uint256 lastUsedEpoch
    ) {
        EcdsaKey memory key = operatorKeys[operator].ecdsaKey;
        return (key.pubkey, key.isRegistered, key.registrationBlock, key.lastUsedEpoch);
    }
    
    /**
     * @dev Get operator keys summary
     */
    function getOperatorSummary(address operator) external view returns (
        bool hasBlsKey,
        bool hasEcdsaKey,
        uint256 totalKeysRegistered,
        string memory metadata
    ) {
        OperatorKeys memory keys = operatorKeys[operator];
        return (keys.hasBlsKey, keys.hasEcdsaKey, keys.totalKeysRegistered, keys.metadata);
    }
    
    /**
     * @dev Get operator by BLS key
     */
    function getOperatorByBlsKey(uint256[2] calldata pubkey) external view returns (address) {
        bytes32 keyHash = keccak256(abi.encodePacked(pubkey[0], pubkey[1]));
        return blsKeyToOperator[keyHash];
    }
    
    /**
     * @dev Get operator by ECDSA key
     */
    function getOperatorByEcdsaKey(address pubkey) external view returns (address) {
        return ecdsaKeyToOperator[pubkey];
    }
    
    /**
     * @dev Get all registered operators
     */
    function getAllOperators() external view returns (address[] memory) {
        return registeredOperators;
    }
    
    /**
     * @dev Get operators for specific epoch
     */
    function getEpochOperators(uint256 epoch) external view returns (address[] memory) {
        return epochOperators[epoch];
    }
    
    /**
     * @dev Get operators count
     */
    function getOperatorsCount() external view returns (uint256) {
        return registeredOperators.length;
    }
    
    /**
     * @dev Check if operator has valid keys for current epoch
     */
    function isOperatorActive(address operator) external view returns (bool) {
        return operatorKeys[operator].totalKeysRegistered > 0 && 
               (operatorKeys[operator].hasBlsKey || operatorKeys[operator].hasEcdsaKey);
    }
    
    /**
     * @dev Get current epoch info
     */
    function getCurrentEpochInfo() external view returns (
        uint256 epoch,
        uint256 operatorsCount,
        bool registrationOpen_
    ) {
        return (currentEpoch, epochOperators[currentEpoch].length, registrationOpen);
    }
    
    /**
     * @dev Batch get BLS keys for multiple operators
     */
    function getBatchBlsKeys(address[] calldata operators) 
        external 
        view 
        returns (uint256[2][] memory pubkeys, uint256[4][] memory pubkeysG2) 
    {
        pubkeys = new uint256[2][](operators.length);
        pubkeysG2 = new uint256[4][](operators.length);
        
        for (uint i = 0; i < operators.length; i++) {
            if (operatorKeys[operators[i]].hasBlsKey) {
                pubkeys[i] = operatorKeys[operators[i]].blsKey.pubkey;
                pubkeysG2[i] = operatorKeys[operators[i]].blsKey.pubkeyG2;
            }
        }
    }
    
    /**
     * @dev Check if a BLS key is valid format (external view)
     */
    function isValidBlsKeyFormat(
        uint256[2] calldata pubkey,
        uint256[4] calldata pubkeyG2
    ) external pure returns (bool) {
        return _isValidBlsKey(pubkey, pubkeyG2);
    }
}