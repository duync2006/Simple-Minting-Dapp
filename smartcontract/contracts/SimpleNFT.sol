// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721Pausable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
// import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
/**
 * @title SimpleNFT
 * @dev A basic NFT contract implementing ERC-721 with metadata, access control, mint limits, and pausable functionality
 */
contract SimpleNFT is ERC721URIStorage, ERC721Pausable, AccessControl {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    uint256 private tokenIdCounter;
    // Maximum number of NFTs per address
    uint256 public maxMintsPerAddress;
    // Maximum total supply
    uint256 public maxSupply;
    // Mapping to track number of mints per address
    mapping(address => uint256) public mintCount;
    // Base URI for metadata
    string private _baseTokenURI;

    // Events
    event MintedNFT(address indexed minter, uint256 indexed tokenId, string tokenURI);
    event MaxMintsPerAddressUpdated(uint256 oldValue, uint256 newValue);
    event MaxSupplyUpdated(uint256 oldValue, uint256 newValue);
    event BaseURIUpdated(string oldBaseURI, string newBaseURI);

    // Custom errors
    error MintLimitExceeded(address minter, uint256 mintCount, uint256 maxMints);
    error MaxSupplyReached(uint256 currentSupply, uint256 maxSupply);
    error InvalidAddress(address invalidAddress);
    error InvalidValue(string message);

    /**
     * @dev Constructor initializes the NFT collection
     * @param _name Name of the NFT collection
     * @param _symbol Symbol of the NFT collection
     * @param _baseURI Base URI for NFT metadata
     * @param _mintLimit Maximum number of NFTs per address
     * @param _supplyLimit Maximum total supply of NFTs
     */
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI,
        uint256 _mintLimit,
        uint256 _supplyLimit
    ) ERC721(_name, _symbol) {
        _baseTokenURI = _baseURI;
        maxMintsPerAddress = _mintLimit;
        maxSupply = _supplyLimit;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Mints a new NFT token
     * @param _recipient Address to receive the NFT
     * @param _tokenURI URI for the token metadata
     * @return tokenId The ID of the minted token
     */
    function mint(address _recipient, string memory _tokenURI) 
        public 
        whenNotPaused 
        returns (uint256) 
    {
        // Check if recipient is valid
        if (_recipient == address(0)) revert InvalidAddress(address(0));
        
        // Check if mint limit per address is exceeded
        if (mintCount[_recipient] >= maxMintsPerAddress) 
            revert MintLimitExceeded(_recipient, mintCount[_recipient], maxMintsPerAddress);

        // Check if max supply is reached
        if (tokenIdCounter>= maxSupply) 
            revert MaxSupplyReached(tokenIdCounter, maxSupply);

        // Increment token counter and mint
        tokenIdCounter++;
        uint256 tokenId = tokenIdCounter;
        
        _safeMint(_recipient, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        // Update mint count for the recipient
        mintCount[_recipient]++;

        // Emit minted event
        emit MintedNFT(_recipient, tokenId, _tokenURI);

        return tokenId;
    }

    /**
     * @dev Allows owner to mint a token for another address (for admin purposes)
     * @param _recipient Address to receive the NFT
     * @param _tokenURI URI for the token metadata
     * @return tokenId The ID of the minted token
     */
    function adminMint(address _recipient, string memory _tokenURI) 
        public 
        onlyRole(ADMIN_ROLE)
        returns (uint256) 
    {
        if (_recipient == address(0)) revert InvalidAddress(address(0));

        // Check if max supply is reached
        if (tokenIdCounter >= maxSupply) 
            revert MaxSupplyReached(tokenIdCounter, maxSupply);

        // Increment token counter and mint
        tokenIdCounter++;
        uint256 tokenId = tokenIdCounter;
        _safeMint(_recipient, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        emit MintedNFT(_recipient, tokenId, _tokenURI);

        return tokenId;
    }

    /**
     * @dev Pauses minting functionality
     */
    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses minting functionality
     */
    function unpause() public onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Sets the maximum number of NFTs that can be minted per address
     * @param  _newMaxMints New maximum mint limit per address
     */
    function setMaxMintsPerAddress(uint256 _newMaxMints) public onlyRole(ADMIN_ROLE) {
        if (_newMaxMints == 0) revert InvalidValue("Max mints per address cannot be zero");
        emit MaxMintsPerAddressUpdated(maxMintsPerAddress, _newMaxMints);
        maxMintsPerAddress = _newMaxMints;
    }

    /**
     * @dev Sets the maximum total supply of NFTs
     * @param _newMaxSupply New maximum total supply
     */
    function setMaxSupply(uint256 _newMaxSupply) public onlyRole(ADMIN_ROLE) {
        if (_newMaxSupply <= tokenIdCounter) 
            revert InvalidValue("New max supply must be greater than current supply");
        
        emit MaxSupplyUpdated(maxSupply, _newMaxSupply);
        maxSupply = _newMaxSupply;
    }
      
    /**
     * @dev Sets the base URI for all token metadata
     * @param _newBaseURI New base URI
     */
    function setBaseURI(string memory _newBaseURI) public onlyRole(ADMIN_ROLE) {
        emit BaseURIUpdated(_baseTokenURI, _newBaseURI);
        _baseTokenURI = _newBaseURI;
    }

    /**
     * @dev Returns the token URI
     * @param _tokenId Token ID
     * @return URI for the token metadata
     */
    function tokenURI(uint256 _tokenId) public view override(ERC721,ERC721URIStorage) returns (string memory) {
        return super.tokenURI(_tokenId);
    }

    /**
     * @dev Returns the base token URI
     * @return Base URI string
     */
    function baseURI() public view returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Returns the total number of tokens minted
     * @return Total supply
     */
    function totalSupply() public view returns (uint256) {
        return tokenIdCounter;
    }

     /**
     * @dev See {IERC165-supportsInterface}.
     * Overridden to resolve inheritance conflict.
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Internal function to update owner state during transfers.
     * Overridden to resolve inheritance conflict.
     */
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Pausable) returns (address) {
        return super._update(to, tokenId, auth);
    }
} 