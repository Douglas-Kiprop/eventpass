// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
// Remove: import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title EventRegistry
 * @dev Manages the creation and details of events for which NFTs can be minted.
 */
contract EventRegistry is Ownable {
    // Remove: using Counters for Counters.Counter;

    // --- State Variables ---

    // Use a simple uint256 for the event ID counter
    uint256 private _eventIds;

    struct Event {
        uint256 id;
        string name;
        address organizer; // Address organizing the event (receives payments)
        uint256 price; // Price in USDC (assuming 6 decimals for USDC)
        uint256 maxSupply; // Maximum number of tickets available
        uint256 ticketsSold; // Number of tickets sold so far
        bool isActive; // Whether the event is currently active for sales
        mapping(uint256 => address) ticketIdToBuyer; // Track buyer for each ticket ID
        // Add other relevant details: date, location, metadata URI base?
    }

    // Mapping from event ID to Event details
    mapping(uint256 => Event) public events;

    // Address of the PaymentHandler contract (set by owner after deployment)
    // This is needed if EventRegistry needs to call PaymentHandler (e.g., for validation)
    // address public paymentHandlerAddress; // Optional, depending on interaction flow

    // --- Events ---
    event EventCreated(
        uint256 indexed eventId,
        string name,
        address indexed organizer,
        uint256 price,
        uint256 maxSupply
    );
    event EventUpdated(uint256 indexed eventId, bool isActive); // Example update event
    event SaleRecorded(uint256 indexed eventId, uint256 indexed tokenId, address indexed buyer);

    // --- Errors ---
    error InvalidEventId(uint256 eventId);
    error UpdateFailed(string reason);
    error NotPaymentHandler(); // If restricting access to recordSale

    // --- Constructor ---
    constructor(address initialOwner) Ownable(initialOwner) {
        // Initialization logic if needed
    }

    // --- Core Logic ---

    /**
     * @notice Creates a new event listing.
     * @dev Only callable by the owner. Emits an EventCreated event.
     * @param name Name of the event.
     * @param organizer Address that will receive payments for tickets.
     * @param price Price of one ticket in the smallest unit of USDC (e.g., 10 * 10**6 for $10).
     * @param maxSupply Maximum number of tickets that can be sold.
     * @param isActive Initial active status for sales.
     * @return eventId The ID of the newly created event.
     */
    function createEvent(
        string memory name,
        address organizer,
        uint256 price,
        uint256 maxSupply,
        bool isActive
    ) public onlyOwner returns (uint256) {
        require(organizer != address(0), "EventRegistry: Organizer cannot be zero address");
        require(maxSupply > 0, "EventRegistry: Max supply must be greater than zero");

        // Use the current counter value as the new ID, then increment
        uint256 newEventId = _eventIds;
        _eventIds++; // Increment the counter

        Event storage newEvent = events[newEventId];
        newEvent.id = newEventId;
        newEvent.name = name;
        newEvent.organizer = organizer;
        newEvent.price = price;
        newEvent.maxSupply = maxSupply;
        newEvent.ticketsSold = 0; // Initialize tickets sold
        newEvent.isActive = isActive; // Set initial active status

        emit EventCreated(newEventId, name, organizer, price, maxSupply);
        return newEventId;
    }

    /**
     * @notice Records the sale of a ticket for an event.
     * @dev Increments the ticketsSold count and records the buyer for the specific token ID.
     * Typically called by the PaymentHandler contract after successful payment and minting.
     * Consider adding access control (e.g., onlyPaymentHandler modifier).
     * @param eventId The ID of the event.
     * @param tokenId The ID of the NFT ticket that was minted.
     * @param buyer The address of the account that purchased the ticket.
     */
    function recordSale(uint256 eventId, uint256 tokenId, address buyer) public /* onlyPaymentHandler */ {
        // Optional: Add modifier to restrict caller
        // require(msg.sender == paymentHandlerAddress, "EventRegistry: Caller is not the PaymentHandler");

        Event storage eventToUpdate = events[eventId];

        // Check if the event exists (simple check: organizer is not zero address)
        if (eventToUpdate.organizer == address(0)) {
            revert InvalidEventId(eventId);
        }
        // Ensure we don't somehow sell more than the max supply
        require(eventToUpdate.ticketsSold < eventToUpdate.maxSupply, "EventRegistry: Event already sold out");

        eventToUpdate.ticketsSold++;
        eventToUpdate.ticketIdToBuyer[tokenId] = buyer; // Record buyer for this specific token

        emit SaleRecorded(eventId, tokenId, buyer);
    }


    // --- View Functions ---

    /**
     * @notice Retrieves details for a specific event.
     * @param eventId The ID of the event.
     * @return organizer Address of the event organizer.
     * @return price Ticket price.
     * @return maxSupply Maximum ticket supply.
     * @return ticketsSold Number of tickets sold.
     * @return isActive Whether the event is active for sales.
     * @return name_ Name of the event.
     */
    function getEventDetails(uint256 eventId)
        public
        view
        returns (
            address organizer,
            uint256 price,
            uint256 maxSupply,
            uint256 ticketsSold,
            bool isActive,
            string memory name_ // Added name return
        )
    {
        Event storage requestedEvent = events[eventId];
        // Check if the event exists before returning details
        if (requestedEvent.organizer == address(0)) {
             revert InvalidEventId(eventId);
        }
        return (
            requestedEvent.organizer,
            requestedEvent.price,
            requestedEvent.maxSupply,
            requestedEvent.ticketsSold,
            requestedEvent.isActive,
            requestedEvent.name
        );
    }

    /**
     * @notice Gets the buyer of a specific ticket ID for an event.
     * @param eventId The ID of the event.
     * @param tokenId The ID of the ticket.
     * @return The address of the buyer. Returns address(0) if not sold or invalid IDs.
     */
    function getTicketBuyer(uint256 eventId, uint256 tokenId) public view returns (address) {
         // Check if the event exists first
         if (events[eventId].organizer == address(0)) {
             revert InvalidEventId(eventId);
         }
         return events[eventId].ticketIdToBuyer[tokenId];
    }

    /**
     * @notice Gets the current highest assigned event ID. Useful for UIs listing events.
     * @return The next ID that will be assigned. If 0, no events created yet.
     */
    function getCurrentEventId() public view returns (uint256) {
        // Returns the *next* ID to be assigned. If 0, means no events created.
        // If you want the ID of the *last* created event, return _eventIds - 1 (handle case where _eventIds is 0).
        return _eventIds;
    }


    // --- Admin Functions ---

    /**
     * @notice Updates the active status of an event.
     * @dev Only callable by the owner.
     * @param eventId The ID of the event to update.
     * @param _isActive The new active status.
     */
    function setEventActiveStatus(uint256 eventId, bool _isActive) public onlyOwner {
        Event storage eventToUpdate = events[eventId];
        if (eventToUpdate.organizer == address(0)) {
            revert InvalidEventId(eventId);
        }
        if (eventToUpdate.isActive == _isActive) {
            revert UpdateFailed("Status is already set to the desired value");
        }
        eventToUpdate.isActive = _isActive;
        emit EventUpdated(eventId, _isActive);
    }

    /* Optional: Function to set PaymentHandler address
    function setPaymentHandlerAddress(address _handlerAddress) public onlyOwner {
        require(_handlerAddress != address(0), "EventRegistry: Invalid handler address");
        paymentHandlerAddress = _handlerAddress;
        // Emit event?
    }
    */

    // Add withdraw functions similar to PaymentHandler if needed
}