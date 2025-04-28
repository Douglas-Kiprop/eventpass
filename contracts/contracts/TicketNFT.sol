// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketNFT is ERC721, ERC721URIStorage, Ownable {
    // Counter for generating unique token IDs
    uint256 private _nextTokenId;

    // --- Structs ---
    // Placeholder for potential future metadata stored directly on-chain
    // struct TicketMetadata {
    //     uint256 eventId;
    //     string eventName;
    //     uint256 eventDate;
    //     string perks; // Optional perks description
    // }
    // mapping(uint256 => TicketMetadata) private _ticketMetadata;

    // --- Constructor ---
    constructor(address initialOwner)
        ERC721("EventPass Ticket", "EPT") // Set NFT Name and CORRECT Symbol for tests
        Ownable(initialOwner) // Set the initial owner (deployer)
    {}

    // --- Minting Function ---
    /**
     * @dev Mints a new ticket NFT to a specified address.
     * Can only be called by the contract owner (PaymentHandler).
     * @param to The address to mint the NFT to.
     * @param uri The token URI for the NFT's metadata (can point to off-chain JSON).
     * @return The ID of the minted token.
     */
    function safeMint(address to, string memory uri)
        public
        onlyOwner // Restrict minting to the owner
        returns (uint256)
    {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri); // Now this function is available via ERC721URIStorage

        // Optional: Store on-chain metadata if using the struct approach
        // _ticketMetadata[tokenId] = TicketMetadata(eventId, eventName, eventDate, perks);

        // Emit an event (inherits Transfer event from ERC721)
        return tokenId;
    }

    // --- Metadata Functions ---

    // Override baseURI to make it empty if token URIs are absolute
    function _baseURI() internal pure override returns (string memory) {
        return "";
    }

    // Optional: Function to retrieve on-chain metadata if stored
    // function getTicketMetadata(uint256 tokenId) public view returns (TicketMetadata memory) {
    //     require(_exists(tokenId), "TicketNFT: Metadata query for nonexistent token");
    //     return _ticketMetadata[tokenId];
    // }

    // --- Other Functions ---

    // --- Override required functions for ERC721URIStorage ---

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage) // Specify override from both
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
     function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage) // Specify override from both
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // --- Remove unnecessary overrides for v5.x ---
    // function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
    //     super._burn(tokenId);
    // }

    // function _update(address to, uint256 tokenId, address auth)
    //     internal
    //     override(ERC721, ERC721URIStorage)
    //     returns (address)
    // {
    //     return super._update(to, tokenId, auth);
    // }

    // _increaseBalance is only defined in ERC721, so its override remains the same
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721)
    {
        super._increaseBalance(account, value);
    }

    // --- Owner Functions ---
    // Owner can transfer ownership if needed (e.g., to the PaymentHandler contract post-deployment)
    // transferOwnership is inherited from Ownable
}