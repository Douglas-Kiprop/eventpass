const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EventRegistry", function () {
    let EventRegistry;
    let eventRegistry;
    let owner;
    let organizer;
    let buyer1;
    let buyer2;
    let addrs;

    const eventName = "Test Concert";
    const eventPrice = ethers.parseUnits("10", 6); // Example: 10 USDC (assuming 6 decimals)
    const eventMaxSupply = 100;

    // Deploy a fresh contract before each test
    beforeEach(async function () {
        EventRegistry = await ethers.getContractFactory("EventRegistry");
        [owner, organizer, buyer1, buyer2, ...addrs] = await ethers.getSigners();

        // Deploy the contract with the deployer as the initial owner
        eventRegistry = await EventRegistry.deploy(owner.address);
        // await eventRegistry.deployed(); // Consider if needed based on Hardhat version
    });

    // Test Suite 1: Deployment
    describe("Deployment", function () {
        it("Should set the correct initial owner", async function () {
            expect(await eventRegistry.owner()).to.equal(owner.address);
        });

        it("Should initialize the event ID counter to 0", async function () {
            // getCurrentEventId returns the *next* ID to be assigned
            expect(await eventRegistry.getCurrentEventId()).to.equal(0);
        });
    });

    // Test Suite 2: Event Creation
    describe("Event Creation", function () {
        it("Should allow the owner to create a new event", async function () {
            const tx = await eventRegistry.connect(owner).createEvent(
                eventName,
                organizer.address,
                eventPrice,
                eventMaxSupply,
                true // isActive
            );

            // Check event emission
            await expect(tx)
                .to.emit(eventRegistry, "EventCreated")
                .withArgs(0, eventName, organizer.address, eventPrice, eventMaxSupply); // eventId should be 0

            // Check stored details
            const [org, price, maxSupply, sold, active, name] = await eventRegistry.getEventDetails(0);
            expect(org).to.equal(organizer.address);
            expect(price).to.equal(eventPrice);
            expect(maxSupply).to.equal(eventMaxSupply);
            expect(sold).to.equal(0);
            expect(active).to.equal(true);
            expect(name).to.equal(eventName);

            // Check next event ID
            expect(await eventRegistry.getCurrentEventId()).to.equal(1);
        });

        it("Should increment event ID for subsequent events", async function () {
            await eventRegistry.connect(owner).createEvent("Event 1", organizer.address, 100, 10, true);
            await eventRegistry.connect(owner).createEvent("Event 2", organizer.address, 200, 20, false);

            expect(await eventRegistry.getCurrentEventId()).to.equal(2);

            const details1 = await eventRegistry.getEventDetails(0);
            expect(details1[5]).to.equal("Event 1"); // Check name using index

            const details2 = await eventRegistry.getEventDetails(1);
            expect(details2[5]).to.equal("Event 2"); // Check name using index
        });


        it("Should NOT allow a non-owner to create an event", async function () {
            await expect(
                eventRegistry.connect(organizer).createEvent( // Attempting with organizer account
                    eventName,
                    organizer.address,
                    eventPrice,
                    eventMaxSupply,
                    true
                )
            ).to.be.revertedWithCustomError(eventRegistry, "OwnableUnauthorizedAccount")
             .withArgs(organizer.address);
        });

        it("Should revert if organizer address is zero", async function () {
            await expect(
                eventRegistry.connect(owner).createEvent(
                    eventName,
                    ethers.ZeroAddress, // Invalid organizer
                    eventPrice,
                    eventMaxSupply,
                    true
                )
            ).to.be.revertedWith("EventRegistry: Organizer cannot be zero address");
        });

        it("Should revert if max supply is zero", async function () {
            await expect(
                eventRegistry.connect(owner).createEvent(
                    eventName,
                    organizer.address,
                    eventPrice,
                    0, // Invalid max supply
                    true
                )
            ).to.be.revertedWith("EventRegistry: Max supply must be greater than zero");
        });
    });

    // Test Suite 3: Recording Sales
    describe("Recording Sales", function () {
        let eventId;

        beforeEach(async function() {
            // Create an event first
            const tx = await eventRegistry.connect(owner).createEvent(
                eventName,
                organizer.address,
                eventPrice,
                eventMaxSupply,
                true
            );
            // Get the event ID from the transaction receipt or event logs if needed,
            // but since it's the first event, we know it's 0.
            eventId = 0;
        });

        it("Should record a sale correctly", async function () {
            const tokenId = 1; // Example token ID minted for this sale
            const buyer = buyer1.address;

            // Assume recordSale can be called by anyone for now (as per current contract)
            // In a real scenario, this might be restricted (e.g., only PaymentHandler)
            const tx = await eventRegistry.connect(owner).recordSale(eventId, tokenId, buyer); // Using owner for simplicity

            // Check event emission
            await expect(tx)
                .to.emit(eventRegistry, "SaleRecorded")
                .withArgs(eventId, tokenId, buyer);

            // Check updated event details
            const [, , , ticketsSold, , ] = await eventRegistry.getEventDetails(eventId);
            expect(ticketsSold).to.equal(1);

            // Check buyer mapping
            expect(await eventRegistry.getTicketBuyer(eventId, tokenId)).to.equal(buyer);
        });

        it("Should increment ticketsSold for multiple sales", async function () {
            await eventRegistry.connect(owner).recordSale(eventId, 1, buyer1.address);
            await eventRegistry.connect(owner).recordSale(eventId, 2, buyer2.address);

            const [, , , ticketsSold, , ] = await eventRegistry.getEventDetails(eventId);
            expect(ticketsSold).to.equal(2);
            expect(await eventRegistry.getTicketBuyer(eventId, 1)).to.equal(buyer1.address);
            expect(await eventRegistry.getTicketBuyer(eventId, 2)).to.equal(buyer2.address);
        });

        it("Should revert if trying to record sale for an invalid event ID", async function () {
            const invalidEventId = 99;
            await expect(
                eventRegistry.connect(owner).recordSale(invalidEventId, 1, buyer1.address)
            ).to.be.revertedWithCustomError(eventRegistry, "InvalidEventId")
             .withArgs(invalidEventId);
        });

        it("Should revert if trying to record sale beyond max supply", async function () {
            // Create an event with small supply
            const smallSupply = 2;
            const tx = await eventRegistry.connect(owner).createEvent("Limited Event", organizer.address, 50, smallSupply, true);
            const limitedEventId = 1; // Second event created

            // Record sales up to max supply
            await eventRegistry.connect(owner).recordSale(limitedEventId, 10, buyer1.address);
            await eventRegistry.connect(owner).recordSale(limitedEventId, 11, buyer2.address);

            // Check tickets sold
            let [, , , ticketsSold, , ] = await eventRegistry.getEventDetails(limitedEventId);
            expect(ticketsSold).to.equal(smallSupply);

            // Attempt to record one more sale
            await expect(
                eventRegistry.connect(owner).recordSale(limitedEventId, 12, addrs[0].address)
            ).to.be.revertedWith("EventRegistry: Event already sold out");
        });

        // Add test for access control if `onlyPaymentHandler` is implemented later
        // it("Should revert if recordSale is called by an unauthorized address", async function () { ... });
    });

    // Test Suite 4: View Functions
    describe("View Functions", function () {
        let eventId;

        beforeEach(async function() {
            // Create an event
            await eventRegistry.connect(owner).createEvent(
                eventName,
                organizer.address,
                eventPrice,
                eventMaxSupply,
                true
            );
            eventId = 0;
            // Record a sale
            await eventRegistry.connect(owner).recordSale(eventId, 1, buyer1.address);
        });

        it("getEventDetails: Should return correct details for a valid event", async function () {
            const [org, price, maxSupply, sold, active, name] = await eventRegistry.getEventDetails(eventId);
            expect(org).to.equal(organizer.address);
            expect(price).to.equal(eventPrice);
            expect(maxSupply).to.equal(eventMaxSupply);
            expect(sold).to.equal(1); // One sale recorded
            expect(active).to.equal(true);
            expect(name).to.equal(eventName);
        });

        it("getEventDetails: Should revert for an invalid event ID", async function () {
            const invalidEventId = 99;
            await expect(
                eventRegistry.getEventDetails(invalidEventId)
            ).to.be.revertedWithCustomError(eventRegistry, "InvalidEventId")
             .withArgs(invalidEventId);
        });

        it("getTicketBuyer: Should return correct buyer for a sold ticket", async function () {
            expect(await eventRegistry.getTicketBuyer(eventId, 1)).to.equal(buyer1.address);
        });

        it("getTicketBuyer: Should return zero address for an unsold ticket ID", async function () {
            const unsoldTokenId = 5;
            expect(await eventRegistry.getTicketBuyer(eventId, unsoldTokenId)).to.equal(ethers.ZeroAddress);
        });

        it("getTicketBuyer: Should revert for an invalid event ID", async function () {
            const invalidEventId = 99;
            await expect(
                eventRegistry.getTicketBuyer(invalidEventId, 1)
            ).to.be.revertedWithCustomError(eventRegistry, "InvalidEventId")
             .withArgs(invalidEventId);
        });

        it("getCurrentEventId: Should return the next available ID", async function () {
             expect(await eventRegistry.getCurrentEventId()).to.equal(1); // Only one event created in beforeEach
             await eventRegistry.connect(owner).createEvent("Another Event", organizer.address, 1, 1, true);
             expect(await eventRegistry.getCurrentEventId()).to.equal(2);
        });
    });

     // Test Suite 5: Admin Functions
    describe("Admin Functions", function () {
        let eventId;

        beforeEach(async function() {
            // Create an event
            await eventRegistry.connect(owner).createEvent(
                eventName,
                organizer.address,
                eventPrice,
                eventMaxSupply,
                true // Initially active
            );
            eventId = 0;
        });

        it("setEventActiveStatus: Should allow owner to deactivate an active event", async function () {
            const tx = await eventRegistry.connect(owner).setEventActiveStatus(eventId, false);
            await expect(tx)
                .to.emit(eventRegistry, "EventUpdated")
                .withArgs(eventId, false);

            const [, , , , isActive, ] = await eventRegistry.getEventDetails(eventId);
            expect(isActive).to.equal(false);
        });

        it("setEventActiveStatus: Should allow owner to activate an inactive event", async function () {
            // First deactivate
            await eventRegistry.connect(owner).setEventActiveStatus(eventId, false);
            // Then reactivate
            const tx = await eventRegistry.connect(owner).setEventActiveStatus(eventId, true);
             await expect(tx)
                .to.emit(eventRegistry, "EventUpdated")
                .withArgs(eventId, true);

            const [, , , , isActive, ] = await eventRegistry.getEventDetails(eventId);
            expect(isActive).to.equal(true);
        });

        it("setEventActiveStatus: Should NOT allow non-owner to change status", async function () {
            await expect(
                eventRegistry.connect(organizer).setEventActiveStatus(eventId, false)
            ).to.be.revertedWithCustomError(eventRegistry, "OwnableUnauthorizedAccount")
             .withArgs(organizer.address);
        });

        it("setEventActiveStatus: Should revert for an invalid event ID", async function () {
            const invalidEventId = 99;
            await expect(
                eventRegistry.connect(owner).setEventActiveStatus(invalidEventId, false)
            ).to.be.revertedWithCustomError(eventRegistry, "InvalidEventId")
             .withArgs(invalidEventId);
        });

        it("setEventActiveStatus: Should revert if status is already set to the desired value", async function () {
            // Event is initially active (true)
            await expect(
                eventRegistry.connect(owner).setEventActiveStatus(eventId, true) // Trying to set to true again
            ).to.be.revertedWithCustomError(eventRegistry, "UpdateFailed")
             .withArgs("Status is already set to the desired value");

            // Deactivate it
            await eventRegistry.connect(owner).setEventActiveStatus(eventId, false);

            // Try setting to false again
             await expect(
                eventRegistry.connect(owner).setEventActiveStatus(eventId, false) // Trying to set to false again
            ).to.be.revertedWithCustomError(eventRegistry, "UpdateFailed")
             .withArgs("Status is already set to the desired value");
        });

        // Add tests for setPaymentHandlerAddress if uncommented in contract
        // describe("setPaymentHandlerAddress", function() { ... });
    });

    // Test Suite 6: Ownership (from Ownable)
    describe("Ownership Transfer", function () {
        it("Should allow the current owner to transfer ownership", async function () {
            await eventRegistry.connect(owner).transferOwnership(organizer.address);
            expect(await eventRegistry.owner()).to.equal(organizer.address);
        });

        it("Should NOT allow a non-owner to transfer ownership", async function () {
            await expect(
                eventRegistry.connect(organizer).transferOwnership(buyer1.address)
            ).to.be.revertedWithCustomError(eventRegistry, "OwnableUnauthorizedAccount")
             .withArgs(organizer.address);
        });
    });

});