const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EventPass Integration Test", function () {
    let PaymentHandler, paymentHandler;
    let TicketNFT, ticketNFT;
    let EventRegistry, eventRegistry;
    let MockERC20, usdcToken;
    let owner, organizer, buyer, recipient, otherAccount;
    let eventId;

    const MOCK_ERC20_DECIMALS = 6; // Standard USDC decimals
    const EVENT_NAME = "Integration Test Concert";
    const EVENT_PRICE = ethers.parseUnits("25", MOCK_ERC20_DECIMALS); // 25 mUSDC
    const EVENT_MAX_SUPPLY = 50;
    const TICKET_URI = "ipfs://integrationTestMetadata";

    // Deploy all contracts and set up initial state before each test
    beforeEach(async function () {
        [owner, organizer, buyer, recipient, otherAccount] = await ethers.getSigners();

        // 1. Deploy Mock ERC20 (USDC)
        MockERC20 = await ethers.getContractFactory("MockERC20");
        usdcToken = await MockERC20.deploy("Mock USDC", "mUSDC", MOCK_ERC20_DECIMALS);
        // Mint USDC to buyer
        await usdcToken.mint(buyer.address, ethers.parseUnits("1000", MOCK_ERC20_DECIMALS));

        // 2. Deploy TicketNFT
        TicketNFT = await ethers.getContractFactory("TicketNFT");
        ticketNFT = await TicketNFT.deploy(owner.address);

        // 3. Deploy EventRegistry
        EventRegistry = await ethers.getContractFactory("EventRegistry");
        eventRegistry = await EventRegistry.deploy(owner.address);

        // 4. Deploy PaymentHandler
        PaymentHandler = await ethers.getContractFactory("PaymentHandler");
        paymentHandler = await PaymentHandler.deploy(
            owner.address,
            await ticketNFT.getAddress(),
            await usdcToken.getAddress(),
            await eventRegistry.getAddress()
        );

        // 5. Transfer Ownership of TicketNFT to PaymentHandler
        await ticketNFT.connect(owner).transferOwnership(await paymentHandler.getAddress());

        // 6. Create an event in the registry
        await eventRegistry.connect(owner).createEvent(
            EVENT_NAME,
            organizer.address,
            EVENT_PRICE,
            EVENT_MAX_SUPPLY,
            true // isActive
        );
        eventId = 0; // First event created has ID 0
    });

    it("Should allow a user to successfully purchase a ticket", async function () {
        // --- Setup ---
        const buyerInitialBalance = await usdcToken.balanceOf(buyer.address);
        const organizerInitialBalance = await usdcToken.balanceOf(organizer.address);
        const paymentHandlerInitialBalance = await usdcToken.balanceOf(await paymentHandler.getAddress());

        // --- Pre-conditions ---
        // Buyer approves PaymentHandler to spend USDC
        await usdcToken.connect(buyer).approve(await paymentHandler.getAddress(), EVENT_PRICE);
        expect(await usdcToken.allowance(buyer.address, await paymentHandler.getAddress())).to.equal(EVENT_PRICE);

        // --- Action ---
        // Buyer purchases the ticket
        const purchaseTx = await paymentHandler.connect(buyer).purchaseTicket(
            eventId,
            recipient.address,
            TICKET_URI
        );

        // --- Post-conditions & Verifications ---

        // 1. Check Event Emission using Hardhat Chai Matchers
        await expect(purchaseTx)
            .to.emit(paymentHandler, "TicketPurchased")
            .withArgs(eventId, buyer.address, recipient.address, 0, EVENT_PRICE); // Expect tokenId 0

        // 2. Check USDC Balances
        expect(await usdcToken.balanceOf(buyer.address)).to.equal(buyerInitialBalance - EVENT_PRICE);
        expect(await usdcToken.balanceOf(organizer.address)).to.equal(organizerInitialBalance + EVENT_PRICE);
        // PaymentHandler should not hold the funds long-term
        expect(await usdcToken.balanceOf(await paymentHandler.getAddress())).to.equal(paymentHandlerInitialBalance);

        // 3. Check NFT Minting and Ownership
        const mintedTokenId = 0; // First minted token
        expect(await ticketNFT.ownerOf(mintedTokenId)).to.equal(recipient.address);
        expect(await ticketNFT.tokenURI(mintedTokenId)).to.equal(TICKET_URI);

        // 4. Check EventRegistry Update
        const [, , , ticketsSold, isActive, ] = await eventRegistry.getEventDetails(eventId);
        expect(ticketsSold).to.equal(1);
        expect(isActive).to.be.true; // Event should still be active

        // 5. Check Allowance Reset
        expect(await usdcToken.allowance(buyer.address, await paymentHandler.getAddress())).to.equal(0); // Allowance should be used up
    });

    // --- Add More Integration Tests ---
    // - Test purchasing when event is inactive
    // - Test purchasing when event is sold out
    // - Test purchasing with insufficient allowance/balance
    // - Test purchasing when recipient is zero address
    // - Test interaction with setEventRegistryAddress
    // - Test withdrawal functions (if applicable to integration scenario)
    // - Test scenario where NFT minting fails (requires modifying TicketNFT or PaymentHandler for testing)
});