// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; // Import SafeERC20
import "./TicketNFT.sol"; // Interface for our NFT contract
import "./EventRegistry.sol"; // Interface for our Event Registry

/**
 * @title PaymentHandler
 * @dev Handles USDC payments for minting EventPass NFTs using SafeERC20.
 * Interacts with TicketNFT to mint tokens and EventRegistry for event details.
 * Designed to be the owner of the TicketNFT contract after deployment.
 */
contract PaymentHandler is Ownable {
    using SafeERC20 for IERC20; // Use SafeERC20 for all IERC20 interactions

    // --- State Variables ---

    address public immutable ticketNFTAddress; // Address of the deployed TicketNFT contract
    address public immutable usdcTokenAddress; // Address of the USDC token on Base Sepolia
    address public eventRegistryAddress; // Address of the EventRegistry contract (can be updated by owner)

    // Placeholder for CDP Paymaster integration details (e.g., Paymaster URL or context)
    // address public cdpPaymaster;

    // --- Events ---

    event TicketPurchased(
        uint256 indexed eventId,
        address indexed buyer,
        address indexed recipient,
        uint256 tokenId,
        uint256 pricePaid
    );

    // --- Errors ---
    error PaymentFailed(string reason);
    // Removed TransferFailed as SafeERC20 reverts internally
    // error TransferFailed(address token, address from, address to, uint256 amount);
    error InvalidEvent(uint256 eventId); // Consider importing/using errors from EventRegistry
    error EventNotActive(uint256 eventId); // Consider importing/using errors from EventRegistry
    error EventSoldOut(uint256 eventId); // Consider importing/using errors from EventRegistry
    error InsufficientAllowance(address owner, address spender, uint256 required, uint256 allowed);

    // --- Constructor ---

    constructor(
        address _initialOwner,
        address _ticketNFTAddress,
        address _usdcTokenAddress,
        address _eventRegistryAddress // Accept registry address during deployment
    ) Ownable(_initialOwner) {
        require(_ticketNFTAddress != address(0), "PaymentHandler: Invalid TicketNFT address");
        require(_usdcTokenAddress != address(0), "PaymentHandler: Invalid USDC address");
        require(_eventRegistryAddress != address(0), "PaymentHandler: Invalid EventRegistry address"); // Validate registry address

        ticketNFTAddress = _ticketNFTAddress;
        usdcTokenAddress = _usdcTokenAddress;
        eventRegistryAddress = _eventRegistryAddress; // Set registry address
    }

    // --- Core Logic ---

    /**
     * @notice Allows a user to purchase an NFT ticket for a specific event.
     * @dev Requires the user (msg.sender) to have approved this contract to spend sufficient USDC.
     * Fetches event price and organizer from EventRegistry.
     * Transfers USDC from buyer to organizer.
     * Mints the NFT via TicketNFT contract to the recipient.
     * Updates sales count in EventRegistry.
     * @param eventId The ID of the event to purchase a ticket for.
     * @param recipient The address that will receive the minted NFT.
     * @param tokenURI The metadata URI for the NFT to be minted.
     */
    function purchaseTicket(
        uint256 eventId,
        address recipient,
        string memory tokenURI
        // Add Paymaster context/signature if needed for gasless tx
    ) public payable { // `payable` might be needed depending on Paymaster interaction pattern
        // --- Integrate with EventRegistry ---
        EventRegistry registry = EventRegistry(eventRegistryAddress);
        (address organizer, uint256 price, uint256 maxSupply, uint256 ticketsSold, bool isActive, ) = registry.getEventDetails(eventId);

        // --- Input Validation ---
        if (recipient == address(0)) {
            revert PaymentFailed("Recipient cannot be zero address");
        }
         if (!isActive) {
             revert EventNotActive(eventId);
         }
         if (ticketsSold >= maxSupply) {
             revert EventSoldOut(eventId);
         }

        // --- Payment Handling ---
        IERC20 usdc = IERC20(usdcTokenAddress);
        uint256 allowance = usdc.allowance(msg.sender, address(this));

        if (allowance < price) {
            revert InsufficientAllowance(msg.sender, address(this), price, allowance);
        }

        // Transfer USDC from buyer (msg.sender) to organizer using SafeERC20
        // Pull USDC from buyer to this contract
        // No need to check return value, SafeERC20 reverts on failure
        usdc.safeTransferFrom(msg.sender, address(this), price);

        // Push USDC from this contract to the organizer
        // No need to check return value, SafeERC20 reverts on failure
        usdc.safeTransfer(organizer, price);

        // --- Mint NFT ---
        TicketNFT nftContract = TicketNFT(ticketNFTAddress);
        uint256 newTokenId;
        try nftContract.safeMint(recipient, tokenURI) returns (uint256 _tokenId) {
            newTokenId = _tokenId;
        } catch Error(string memory reason) { // Catch specific Solidity errors
            // If minting fails, attempt to refund buyer using safeTransfer
            // Note: This refund might fail if the contract doesn't hold enough USDC
            // due to prior transfers or other reasons. Consider more robust refund mechanisms if needed.
            usdc.safeTransfer(msg.sender, price); // Refund buyer
            revert PaymentFailed(string.concat("NFT minting failed: ", reason));
        } catch /* (bytes memory lowLevelData) */ { // Catch generic errors (like OwnableUnauthorizedAccount)
            // If minting fails, attempt to refund buyer using safeTransfer
            usdc.safeTransfer(msg.sender, price); // Refund buyer <-- ADDED REFUND HERE
            // Handle minting failure (e.g., emit an event, revert with custom error)
            revert PaymentFailed("NFT minting failed"); // Generic failure message
        }


        // --- Update EventRegistry ---
        registry.recordSale(eventId, newTokenId, msg.sender);

        // --- Emit Event ---
        emit TicketPurchased(eventId, msg.sender, recipient, newTokenId, price);

        // --- TODO: Handle Paymaster Logic ---
    }

    // --- Admin Functions ---

    /**
     * @notice Updates the address of the EventRegistry contract.
     * @dev Allows changing the registry address after deployment if needed.
     * @param _newRegistryAddress The new address of the EventRegistry.
     */
    function setEventRegistryAddress(address _newRegistryAddress) public onlyOwner {
        require(_newRegistryAddress != address(0), "PaymentHandler: Invalid EventRegistry address");
        eventRegistryAddress = _newRegistryAddress;
        // Consider emitting an event here
    }

    /**
     * @notice Allows the owner to withdraw any accidentally sent ERC20 tokens.
     * @param tokenAddress The address of the ERC20 token to withdraw.
     * @param amount The amount of tokens to withdraw.
     */
    function withdrawERC20(address tokenAddress, uint256 amount) public onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        // Use safeTransfer for withdrawal
        token.safeTransfer(owner(), amount);
        // No need to check return value or revert TransferFailed
    }

    /**
     * @notice Allows the owner to withdraw any accidentally sent Ether.
     */
    function withdrawETH() public onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "PaymentHandler: ETH withdrawal failed");
    }

    // --- Receive Ether ---
    // Add receive() function if this contract needs to accept raw ETH (e.g., for Paymaster interactions)
    // receive() external payable {}
}