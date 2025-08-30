// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CarbonCreditNFT
 * @dev ERC721 token representing carbon credits with marketplace functionality
 */
contract CarbonCreditNFT is ERC721, ERC721URIStorage, ReentrancyGuard, Ownable {
    uint256 private _tokenIdCounter;
    
    // Carbon credit metadata
    struct CarbonCredit {
        uint256 tokenId;
        uint256 carbonAmount; // in tonnes of CO2
        string projectName;
        string location;
        uint256 issuanceDate;
        uint256 expiryDate;
        address verifier;
        bool isRetired; // true if credit has been used/retired
        uint256 price; // in wei
        bool isForSale;
    }
    
    // Mappings
    mapping(uint256 => CarbonCredit) public carbonCredits;
    mapping(address => bool) public authorizedVerifiers;
    
    // Events
    event CarbonCreditMinted(
        uint256 indexed tokenId,
        address indexed to,
        uint256 carbonAmount,
        string projectName
    );
    
    event CarbonCreditListed(
        uint256 indexed tokenId,
        uint256 price
    );
    
    event CarbonCreditSold(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 price
    );
    
    event CarbonCreditRetired(
        uint256 indexed tokenId,
        address indexed by
    );
    
    constructor() ERC721("CarbonCredit", "CARBON") Ownable(msg.sender) {}
    
    /**
     * @dev Add authorized verifier
     */
    function addVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = true;
    }
    
    /**
     * @dev Remove authorized verifier
     */
    function removeVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = false;
    }
    
    /**
     * @dev Mint new carbon credit NFT
     */
    function mintCarbonCredit(
        address to,
        uint256 carbonAmount,
        string memory projectName,
        string memory location,
        uint256 expiryDate,
        string memory metadataURI
    ) external {
        require(authorizedVerifiers[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        require(carbonAmount > 0, "Carbon amount must be positive");
        require(expiryDate > block.timestamp, "Expiry date must be in future");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        carbonCredits[tokenId] = CarbonCredit({
            tokenId: tokenId,
            carbonAmount: carbonAmount,
            projectName: projectName,
            location: location,
            issuanceDate: block.timestamp,
            expiryDate: expiryDate,
            verifier: msg.sender,
            isRetired: false,
            price: 0,
            isForSale: false
        });
        
        emit CarbonCreditMinted(tokenId, to, carbonAmount, projectName);
    }
    
    /**
     * @dev List carbon credit for sale
     */
    function listForSale(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(!carbonCredits[tokenId].isRetired, "Credit is retired");
        require(price > 0, "Price must be positive");
        
        carbonCredits[tokenId].price = price;
        carbonCredits[tokenId].isForSale = true;
        
        emit CarbonCreditListed(tokenId, price);
    }
    
    /**
     * @dev Remove from sale
     */
    function removeFromSale(uint256 tokenId) external {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        
        carbonCredits[tokenId].isForSale = false;
        carbonCredits[tokenId].price = 0;
    }
    
    /**
     * @dev Buy carbon credit
     */
    function buyCarbonCredit(uint256 tokenId) external payable nonReentrant {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        require(carbonCredits[tokenId].isForSale, "Token not for sale");
        require(!carbonCredits[tokenId].isRetired, "Credit is retired");
        require(msg.value >= carbonCredits[tokenId].price, "Insufficient payment");
        
        address seller = ownerOf(tokenId);
        uint256 price = carbonCredits[tokenId].price;
        
        // Remove from sale
        carbonCredits[tokenId].isForSale = false;
        carbonCredits[tokenId].price = 0;
        
        // Transfer token
        _transfer(seller, msg.sender, tokenId);
        
        // Transfer payment to seller
        (bool success, ) = payable(seller).call{value: price}("");
        require(success, "Payment transfer failed");
        
        // Refund excess payment
        if (msg.value > price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - price}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit CarbonCreditSold(tokenId, seller, msg.sender, price);
    }
    
    /**
     * @dev Retire carbon credit (use it to offset emissions)
     */
    function retireCarbonCredit(uint256 tokenId) external {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(!carbonCredits[tokenId].isRetired, "Already retired");
        
        carbonCredits[tokenId].isRetired = true;
        carbonCredits[tokenId].isForSale = false;
        carbonCredits[tokenId].price = 0;
        
        emit CarbonCreditRetired(tokenId, msg.sender);
    }
    
    /**
     * @dev Get all tokens owned by an address
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            try this.ownerOf(i) returns (address tokenOwner) {
                if (tokenOwner == owner) {
                    tokenIds[index] = i;
                    index++;
                }
            } catch {
                // Token doesn't exist, skip
            }
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Get all tokens for sale
     */
    function getTokensForSale() external view returns (uint256[] memory) {
        uint256 totalTokens = _tokenIdCounter;
        uint256[] memory forSaleTokens = new uint256[](totalTokens);
        uint256 forSaleCount = 0;
        
        for (uint256 i = 0; i < totalTokens; i++) {
            try this.ownerOf(i) {
                if (carbonCredits[i].isForSale && !carbonCredits[i].isRetired) {
                    forSaleTokens[forSaleCount] = i;
                    forSaleCount++;
                }
            } catch {
                // Token doesn't exist, skip
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](forSaleCount);
        for (uint256 i = 0; i < forSaleCount; i++) {
            result[i] = forSaleTokens[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get carbon credit details
     */
    function getCarbonCredit(uint256 tokenId) external view returns (CarbonCredit memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return carbonCredits[tokenId];
    }
    
    // Required overrides for multiple inheritance
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}