const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

// We'll use a simple mock ERC20 for testing USDC interactions
const MOCK_ERC20_DECIMALS = 6; // Standard for USDC
const MOCK_ERC20_INITIAL_SUPPLY = ethers.parseUnits("1000000", MOCK_ERC20_DECIMALS); // Mint 1M mock USDC

const parseUSDC = (amount) => ethers.parseUnits(amount, 6);
const formatUSDC = (amount) => ethers.formatUnits(amount, 6);

describe("PaymentHandler", function () {
    // --- Constants for testing ---
    const EVENT_NAME = "Test PPV Event";
    const EVENT_PRICE = ethers.parseUnits("25", MOCK_ERC20_DECIMALS); // 25 mock USDC
    const EVENT_MAX_SUPPLY = 500;
    const TOKEN_URI_BASE = "ipfs://examplemetadata/";

    // --- Fixture to deploy all contracts and set up interactions ---
    async function deployContractsFixture() {
        const [owner, organizer, buyer, recipient, otherAccount] = await ethers.getSigners();

        // 1. Deploy Mock ERC20 (USDC)
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        const usdcToken = await MockERC20.deploy("Mock USDC", "mUSDC", MOCK_ERC20_DECIMALS);

        // Mint some mock USDC to the buyer for testing
        await usdcToken.mint(buyer.address, ethers.parseUnits("1000", MOCK_ERC20_DECIMALS)); // Give buyer 1000 mUSDC

        // 2. Deploy TicketNFT
        const TicketNFT = await ethers.getContractFactory("TicketNFT");
        const ticketNFT = await TicketNFT.deploy(owner.address);

        // 3. Deploy EventRegistry
        const EventRegistry = await ethers.getContractFactory("EventRegistry");
        const eventRegistry = await EventRegistry.deploy(owner.address);

        // 4. Deploy PaymentHandler
        const PaymentHandler = await ethers.getContractFactory("PaymentHandler");
        const paymentHandler = await PaymentHandler.deploy(
            owner.address,
            await ticketNFT.getAddress(),
            await usdcToken.getAddress(),
            await eventRegistry.getAddress()
        );

        // 5. Transfer Ownership of TicketNFT to PaymentHandler
        await ticketNFT.connect(owner).transferOwnership(await paymentHandler.getAddress());

        // 6. Create an event in the registry for testing purchases
        await eventRegistry.connect(owner).createEvent(
            EVENT_NAME,
            organizer.address,
            EVENT_PRICE,
            EVENT_MAX_SUPPLY,
            true
        );
        const eventId = 0;

        return {
            paymentHandler,
            ticketNFT,
            usdcToken,
            eventRegistry,
            owner,
            organizer,
            buyer,
            recipient,
            otherAccount,
            eventId
        };
    }

    // --- Test Suite: Deployment & Setup ---
    describe("Deployment and Setup", function () {
        it("Should set the correct owner for PaymentHandler", async function () {
            const { paymentHandler, owner } = await loadFixture(deployContractsFixture);
            expect(await paymentHandler.owner()).to.equal(owner.address);
        });

        it("Should store the correct contract addresses", async function () {
            const { paymentHandler, ticketNFT, usdcToken, eventRegistry } = await loadFixture(deployContractsFixture);
            expect(await paymentHandler.ticketNFTAddress()).to.equal(await ticketNFT.getAddress());
            expect(await paymentHandler.usdcTokenAddress()).to.equal(await usdcToken.getAddress());
            expect(await paymentHandler.eventRegistryAddress()).to.equal(await eventRegistry.getAddress());
        });

        it("Should set PaymentHandler as the owner of TicketNFT", async function () {
            const { paymentHandler, ticketNFT } = await loadFixture(deployContractsFixture);
            expect(await ticketNFT.owner()).to.equal(await paymentHandler.getAddress());
        });

        it("Should have created the initial test event correctly", async function () {
            const { eventRegistry, organizer, eventId } = await loadFixture(deployContractsFixture);
            const [org, price, maxSupply, sold, active, name] = await eventRegistry.getEventDetails(eventId);
            expect(org).to.equal(organizer.address);
            expect(price).to.equal(EVENT_PRICE);
            expect(maxSupply).to.equal(EVENT_MAX_SUPPLY);
            expect(sold).to.equal(0);
            expect(active).to.equal(true);
            expect(name).to.equal(EVENT_NAME);
        });

        it("Should have minted mock USDC to the buyer", async function () {
            const { usdcToken, buyer } = await loadFixture(deployContractsFixture);
            const buyerBalance = await usdcToken.balanceOf(buyer.address);
            expect(buyerBalance).to.equal(ethers.parseUnits("1000", MOCK_ERC20_DECIMALS));
        });
    });

    // --- Test Suite: purchaseTicket Function ---
    describe("purchaseTicket Function", function () {
        it("Should allow a user to purchase a ticket successfully", async function () {
            const { paymentHandler, ticketNFT, usdcToken, eventRegistry, organizer, buyer, recipient, eventId } = await loadFixture(deployContractsFixture);
            const purchaseAmount = EVENT_PRICE;
            const buyerInitialBalance = await usdcToken.balanceOf(buyer.address);
            const organizerInitialBalance = await usdcToken.balanceOf(organizer.address);
            const handlerInitialBalance = await usdcToken.balanceOf(await paymentHandler.getAddress());
            const tokenURI = `${TOKEN_URI_BASE}${eventId}/0`;

            // 1. Buyer approves PaymentHandler to spend USDC
            await usdcToken.connect(buyer).approve(await paymentHandler.getAddress(), purchaseAmount);

            // 2. Buyer calls purchaseTicket
            const tx = await paymentHandler.connect(buyer).purchaseTicket(
                eventId,
                recipient.address,
                tokenURI
            );

            // 3. Check event emission from PaymentHandler
            await expect(tx)
                .to.emit(paymentHandler, "TicketPurchased")
                .withArgs(eventId, buyer.address, recipient.address, 0, purchaseAmount);

            // 4. Check balances
            expect(await usdcToken.balanceOf(buyer.address)).to.equal(buyerInitialBalance - purchaseAmount);
            expect(await usdcToken.balanceOf(organizer.address)).to.equal(organizerInitialBalance + purchaseAmount);
            expect(await usdcToken.balanceOf(await paymentHandler.getAddress())).to.equal(handlerInitialBalance);

            // 5. Check NFT ownership and URI
            const expectedTokenId = 0;
            expect(await ticketNFT.ownerOf(expectedTokenId)).to.equal(recipient.address);
            expect(await ticketNFT.tokenURI(expectedTokenId)).to.equal(tokenURI);

            // 6. Check EventRegistry state
            const [, , , ticketsSold, , ] = await eventRegistry.getEventDetails(eventId);
            expect(ticketsSold).to.equal(1);
            expect(await eventRegistry.getTicketBuyer(eventId, expectedTokenId)).to.equal(buyer.address);
        });

        it("Should revert if buyer has insufficient allowance", async function () {
            const { paymentHandler, usdcToken, buyer, recipient, eventId } = await loadFixture(deployContractsFixture);
            const purchaseAmount = EVENT_PRICE;
            const allowance = purchaseAmount - parseUSDC("1");
            const tokenURI = `${TOKEN_URI_BASE}${eventId}/0`;

            await usdcToken.connect(buyer).approve(await paymentHandler.getAddress(), allowance);

            await expect(
                paymentHandler.connect(buyer).purchaseTicket(eventId, recipient.address, tokenURI)
            ).to.be.revertedWithCustomError(paymentHandler, "InsufficientAllowance")
             .withArgs(buyer.address, await paymentHandler.getAddress(), purchaseAmount, allowance);
        });

        it("Should revert if buyer has insufficient balance (via SafeERC20)", async function () {
            const { paymentHandler, usdcToken, owner, buyer, recipient, eventId } = await loadFixture(deployContractsFixture);
            const purchaseAmount = EVENT_PRICE;
            const tokenURI = `${TOKEN_URI_BASE}${eventId}/0`;

            // Reduce buyer's balance below the price
            const buyerBalance = await usdcToken.balanceOf(buyer.address);
            const amountToLeave = parseUSDC("1"); // Leave 1 USDC
            if (buyerBalance >= purchaseAmount) {
                await usdcToken.connect(buyer).transfer(owner.address, buyerBalance - amountToLeave);
            } else if (buyerBalance > 0) {
                await usdcToken.connect(buyer).transfer(owner.address, buyerBalance > 1 ? buyerBalance - BigInt(1) : buyerBalance);
            }

            const finalBuyerBalance = await usdcToken.balanceOf(buyer.address);

            // Grant full allowance
            await usdcToken.connect(buyer).approve(await paymentHandler.getAddress(), purchaseAmount);

            // Expect the ERC20InsufficientBalance error from the MockERC20 contract
            await expect(
                paymentHandler.connect(buyer).purchaseTicket(eventId, recipient.address, tokenURI)
            ).to.be.revertedWithCustomError(usdcToken, "ERC20InsufficientBalance")
             .withArgs(buyer.address, finalBuyerBalance, purchaseAmount);
        });

        it("Should revert if the event is not active", async function () {
            const { paymentHandler, eventRegistry, owner, buyer, recipient, eventId, usdcToken } = await loadFixture(deployContractsFixture);
            const tokenURI = `${TOKEN_URI_BASE}${eventId}/0`;

            // Deactivate the event
            await eventRegistry.connect(owner).setEventActiveStatus(eventId, false);

            // Approve spending
            await usdcToken.connect(buyer).approve(await paymentHandler.getAddress(), EVENT_PRICE);

            await expect(
                paymentHandler.connect(buyer).purchaseTicket(eventId, recipient.address, tokenURI)
            ).to.be.revertedWithCustomError(paymentHandler, "EventNotActive")
             .withArgs(eventId);
        });

        it("Should revert if the event is sold out", async function () {
            const { paymentHandler, eventRegistry, owner, organizer, buyer, recipient, otherAccount, usdcToken } = await loadFixture(deployContractsFixture);
            const maxSupply = 2;
            const price = parseUSDC("5");
            const tokenURIBaseLimited = `${TOKEN_URI_BASE}limited/`;

            // Create the limited event
            await eventRegistry.connect(owner).createEvent("Limited Event", organizer.address, price, maxSupply, true);
            const limitedEventId = 1;

            // Mint USDC to another buyer
            await usdcToken.connect(owner).mint(otherAccount.address, price * BigInt(2));

            // Approve spending for both buyers
            await usdcToken.connect(buyer).approve(await paymentHandler.getAddress(), price);
            await usdcToken.connect(otherAccount).approve(await paymentHandler.getAddress(), price);

            // Buy the two available tickets
            await paymentHandler.connect(buyer).purchaseTicket(limitedEventId, buyer.address, `${tokenURIBaseLimited}0`);
            await paymentHandler.connect(otherAccount).purchaseTicket(limitedEventId, otherAccount.address, `${tokenURIBaseLimited}1`);

            // Try to buy one more
            await expect(
                paymentHandler.connect(buyer).purchaseTicket(limitedEventId, recipient.address, `${tokenURIBaseLimited}2`)
            ).to.be.revertedWithCustomError(paymentHandler, "EventSoldOut")
             .withArgs(limitedEventId);
        });

        it("Should revert if recipient is the zero address", async function () {
            const { paymentHandler, usdcToken, buyer, eventId } = await loadFixture(deployContractsFixture);
            const tokenURI = `${TOKEN_URI_BASE}${eventId}/0`;

            await usdcToken.connect(buyer).approve(await paymentHandler.getAddress(), EVENT_PRICE);

            await expect(
                paymentHandler.connect(buyer).purchaseTicket(eventId, ethers.ZeroAddress, tokenURI)
            ).to.be.revertedWithCustomError(paymentHandler, "PaymentFailed")
             .withArgs("Recipient cannot be zero address");
        });

        it("Should revert and refund if NFT minting fails", async function () {
            const { paymentHandler, ticketNFT, usdcToken, owner, organizer, buyer, recipient, eventId } = await loadFixture(deployContractsFixture);
            const purchaseAmount = EVENT_PRICE;
            const tokenURI = `${TOKEN_URI_BASE}${eventId}/0`;
            const buyerInitialBalance = await usdcToken.balanceOf(buyer.address);
            const organizerInitialBalance = await usdcToken.balanceOf(organizer.address);
            const handlerInitialBalance = await usdcToken.balanceOf(await paymentHandler.getAddress());

            // Approve spending
            await usdcToken.connect(buyer).approve(await paymentHandler.getAddress(), purchaseAmount);

            // Simulate failure: Transfer ownership of TicketNFT back to owner
            const paymentHandlerAddress = await paymentHandler.getAddress();
            await hre.network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [paymentHandlerAddress],
            });
            const paymentHandlerSigner = await ethers.getSigner(paymentHandlerAddress);
            await owner.sendTransaction({ to: paymentHandlerAddress, value: ethers.parseEther("0.1") });

            await ticketNFT.connect(paymentHandlerSigner).transferOwnership(owner.address);

            await hre.network.provider.request({
                method: "hardhat_stopImpersonatingAccount",
                params: [paymentHandlerAddress],
            });

            // Attempt purchase
            await expect(
                paymentHandler.connect(buyer).purchaseTicket(eventId, recipient.address, tokenURI)
            ).to.be.revertedWithCustomError(paymentHandler, "PaymentFailed")
             .withArgs("NFT minting failed");

            // Check refund
            expect(await usdcToken.balanceOf(buyer.address)).to.equal(buyerInitialBalance);
            expect(await usdcToken.balanceOf(organizer.address)).to.equal(organizerInitialBalance);
            expect(await usdcToken.balanceOf(paymentHandlerAddress)).to.equal(handlerInitialBalance);
        });
    });
});