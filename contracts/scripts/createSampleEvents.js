const { ethers } = require("hardhat");

// --- CONFIGURATION ---
const EVENT_REGISTRY_ADDRESS = "0xdCceD31e8746dF9064B8Cb17A52b15461fe2aCFB"; 
// USDC Token Address on Base Sepolia (from your deployment-output.json)
// const USDC_TOKEN_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Not directly used by EventRegistry.createEvent but good for context

const USDC_DECIMALS = 6; // Standard for USDC

// Sample event data (matches your frontend, prices converted to smallest unit)
const eventsToCreate = [
  {
    name: 'Future Sounds Fest 2025',
    price: ethers.parseUnits("5", USDC_DECIMALS), // 5 USDC
    maxSupply: 1000,
    isActive: true
  },
  {
    name: 'Web3 Innovators Summit 2025',
    price: ethers.parseUnits("0", USDC_DECIMALS), // FREE
    maxSupply: 500,
    isActive: true
  },
  {
    name: 'Digital Art Showcase 2025',
    price: ethers.parseUnits("2", USDC_DECIMALS), // 2 USDC
    maxSupply: 200,
    isActive: true
  },
  {
    name: 'Indie Game Dev Meetup 2025',
    price: ethers.parseUnits("1", USDC_DECIMALS), // 1 USDC
    maxSupply: 300,
    isActive: true
  }
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Using account to create events:", deployer.address);
  console.log(`Account balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);

  if (!EVENT_REGISTRY_ADDRESS || EVENT_REGISTRY_ADDRESS === "YOUR_EVENT_REGISTRY_CONTRACT_ADDRESS") {
    console.error("EventRegistry contract address is not set correctly. Please check the script.");
    process.exit(1);
  }

  const eventRegistry = await ethers.getContractAt("EventRegistry", EVENT_REGISTRY_ADDRESS);
  console.log(`Attached to EventRegistry at ${eventRegistry.target}`);

  for (const eventData of eventsToCreate) {
    console.log(`\nCreating event: ${eventData.name}...`);
    try {
      // The organizer is set to the deployer's address (the account running this script)
      const tx = await eventRegistry.createEvent(
        eventData.name,
        deployer.address, 
        eventData.price,
        eventData.maxSupply,
        eventData.isActive
      );
      console.log(`  Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`  Transaction confirmed in block: ${receipt.blockNumber}`);
      
      // Try to find the EventCreated event to get the new event ID
      const eventCreatedLog = receipt.logs.find(log => {
        try {
          // Ensure the log address matches the EventRegistry contract address
          if (log.address.toLowerCase() !== EVENT_REGISTRY_ADDRESS.toLowerCase()) return false;
          const parsedLog = eventRegistry.interface.parseLog({ topics: log.topics, data: log.data });
          return parsedLog && parsedLog.name === "EventCreated";
        } catch (e) {
          // console.warn("Could not parse a log entry:", e.message);
          return false;
        }
      });

      if (eventCreatedLog) {
        const parsed = eventRegistry.interface.parseLog({ topics: eventCreatedLog.topics, data: eventCreatedLog.data });
        console.log(`  Event created successfully! Event ID: ${parsed.args.eventId.toString()}, Organizer: ${parsed.args.organizer}, Name: ${parsed.args.name}`);
      } else {
        console.log("  Event created, but could not parse EventCreated log to find ID directly from receipt. Check manually if needed.");
      }

    } catch (error) {
      console.error(`  Failed to create event ${eventData.name}:`, error.reason || error.shortMessage || error.message);
      if (error.data) {
        console.error("  Error data:", error.data);
      }
    }
  }

  console.log("\nFinished creating sample events.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });