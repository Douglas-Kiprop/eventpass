const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TicketNFT", function () {
    let TicketNFT;
    let ticketNFT;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    // Deploy a fresh contract before each test
    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        TicketNFT = await ethers.getContractFactory("TicketNFT");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        // Deploy the contract
        const initialOwner = owner.address; // Deployer is the initial owner
        ticketNFT = await TicketNFT.deploy(initialOwner);
        // Hardhat versions might differ slightly in how deployment is awaited
        // If the above line causes issues, try:
        // await ticketNFT.deployed();
        // or check the latest Hardhat documentation for contract deployment patterns.
    });

    // Test Suite 1: Deployment
    describe("Deployment", function () {
        it("Should set the correct initial owner", async function () {
            expect(await ticketNFT.owner()).to.equal(owner.address);
        });

        it("Should have the correct name and symbol", async function () {
            expect(await ticketNFT.name()).to.equal("EventPass Ticket");
            expect(await ticketNFT.symbol()).to.equal("EPT");
        });

        it("Should initialize the token counter to 0", async function () {
            // Assuming the counter starts at 0 and increments *before* minting the first token (ID 0 or 1 depending on implementation)
            // Let's check the internal counter state if possible, or infer from minting the first token.
            // OpenZeppelin's ERC721 _nextTokenId starts at 0 by default.
            // We can test this by minting the first token and checking its ID.
            await ticketNFT.connect(owner).safeMint(addr1.address, "ipfs://token1");
            expect(await ticketNFT.ownerOf(0)).to.equal(addr1.address); // Expecting first token ID to be 0
        });
    });

    // Test Suite 2: Minting
    describe("Minting", function () {
        it("Should allow the owner to mint a new NFT", async function () {
            const recipient = addr1.address;
            const tokenURI = "ipfs://tokenMetadata1";

            // Mint the token
            await expect(ticketNFT.connect(owner).safeMint(recipient, tokenURI))
                .to.emit(ticketNFT, "Transfer") // Check for the Transfer event
                .withArgs(ethers.ZeroAddress, recipient, 0); // From zero address, to recipient, tokenId 0

            // Check ownership and token URI
            expect(await ticketNFT.ownerOf(0)).to.equal(recipient);
            expect(await ticketNFT.tokenURI(0)).to.equal(tokenURI);
        });

        it("Should increment the token ID after minting", async function () {
            await ticketNFT.connect(owner).safeMint(addr1.address, "uri1");
            await ticketNFT.connect(owner).safeMint(addr2.address, "uri2");

            expect(await ticketNFT.ownerOf(0)).to.equal(addr1.address);
            expect(await ticketNFT.ownerOf(1)).to.equal(addr2.address);
            expect(await ticketNFT.tokenURI(1)).to.equal("uri2");
        });

        it("Should NOT allow a non-owner to mint a new NFT", async function () {
            const recipient = addr1.address;
            const tokenURI = "ipfs://forbidden";

            // Attempt to mint from a non-owner account (addr1)
            await expect(
                ticketNFT.connect(addr1).safeMint(recipient, tokenURI)
            ).to.be.revertedWithCustomError(TicketNFT, "OwnableUnauthorizedAccount") // Using custom error from Ownable
             .withArgs(addr1.address);
        });

        it("Should revert minting to the zero address", async function () {
             const tokenURI = "ipfs://zero";
             // ERC721 standard prevents minting to zero address
             await expect(
                 ticketNFT.connect(owner).safeMint(ethers.ZeroAddress, tokenURI)
             ).to.be.revertedWithCustomError(TicketNFT, "ERC721InvalidReceiver")
              .withArgs(ethers.ZeroAddress);
        });
    });

    // Test Suite 3: Ownership
    describe("Ownership", function () {
        it("Should allow the current owner to transfer ownership", async function () {
            await ticketNFT.connect(owner).transferOwnership(addr1.address);
            expect(await ticketNFT.owner()).to.equal(addr1.address);
        });

        it("Should NOT allow a non-owner to transfer ownership", async function () {
            await expect(
                ticketNFT.connect(addr1).transferOwnership(addr2.address)
            ).to.be.revertedWithCustomError(TicketNFT, "OwnableUnauthorizedAccount")
             .withArgs(addr1.address);
        });

         it("Should emit OwnershipTransferred event", async function () {
            await expect(ticketNFT.connect(owner).transferOwnership(addr1.address))
                .to.emit(ticketNFT, "OwnershipTransferred")
                .withArgs(owner.address, addr1.address);
        });
    });

    // Add more tests as needed (e.g., burning if implemented, approvals, etc.)

});