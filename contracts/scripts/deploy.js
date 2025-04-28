const hre = require("hardhat");
const ethers = hre.ethers;

// Base Sepolia USDC Address
const BASE_SEPOLIA_USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Official Base Sepolia USDC

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const initialOwner = deployer.address; // Deployer will be the initial owner

    // --- Deploy TicketNFT ---
    const TicketNFT = await ethers.getContractFactory("TicketNFT");
    const ticketNFT = await TicketNFT.deploy(initialOwner);
    await ticketNFT.waitForDeployment();
    const ticketNFTAddress = await ticketNFT.getAddress();
    console.log("TicketNFT deployed to:", ticketNFTAddress);

    // --- Deploy EventRegistry ---
    const EventRegistry = await ethers.getContractFactory("EventRegistry");
    const eventRegistry = await EventRegistry.deploy(initialOwner);
    await eventRegistry.waitForDeployment();
    const eventRegistryAddress = await eventRegistry.getAddress();
    console.log("EventRegistry deployed to:", eventRegistryAddress);

    // --- Deploy PaymentHandler ---
    console.log(`Using Base Sepolia USDC address: ${BASE_SEPOLIA_USDC_ADDRESS}`);
    const PaymentHandler = await ethers.getContractFactory("PaymentHandler");
    const paymentHandler = await PaymentHandler.deploy(
        initialOwner,
        ticketNFTAddress,
        BASE_SEPOLIA_USDC_ADDRESS, // Use actual Base Sepolia USDC address
        eventRegistryAddress
    );
    await paymentHandler.waitForDeployment();
    const paymentHandlerAddress = await paymentHandler.getAddress();
    console.log("PaymentHandler deployed to:", paymentHandlerAddress);

    // --- Post-Deployment Steps ---
    console.log("\nPerforming post-deployment steps...");

    // 1. Transfer Ownership of TicketNFT to PaymentHandler
    console.log(`Transferring ownership of TicketNFT (${ticketNFTAddress}) to PaymentHandler (${paymentHandlerAddress})...`);
    const tx = await ticketNFT.connect(deployer).transferOwnership(paymentHandlerAddress);
    await tx.wait(); // Wait for the transaction to be mined
    console.log("TicketNFT ownership transferred successfully.");

    // Optional: Verify ownership transfer
    const newOwner = await ticketNFT.owner();
    console.log(`New owner of TicketNFT is: ${newOwner}`);
    if (newOwner !== paymentHandlerAddress) {
        console.error("Ownership transfer verification failed!");
    }

    // Note: If EventRegistry needed the PaymentHandler address, you'd set it here.
    // Example:
    // console.log(`Setting PaymentHandler address in EventRegistry (${eventRegistryAddress})...`);
    // const setHandlerTx = await eventRegistry.connect(deployer).setPaymentHandler(paymentHandlerAddress); // Assuming setPaymentHandler exists
    // await setHandlerTx.wait();
    // console.log("PaymentHandler address set in EventRegistry.");

    console.log("\nDeployment and setup complete!");
    console.log("----------------------------------------------------");
    console.log("Deployed Contract Addresses:");
    console.log("  TicketNFT:     ", ticketNFTAddress);
    console.log("  EventRegistry: ", eventRegistryAddress);
    console.log("  PaymentHandler:", paymentHandlerAddress);
    console.log("  USDC (Base Sepolia):", BASE_SEPOLIA_USDC_ADDRESS); // Log the USDC address used
    console.log("----------------------------------------------------");

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });