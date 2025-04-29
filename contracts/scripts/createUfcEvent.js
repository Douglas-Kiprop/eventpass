const { ethers } = require("hardhat");
const deploymentOutput = require("../../deployment-output.json");

async function main() {
  // Get the signer
  const [signer] = await ethers.getSigners();
  console.log(`Using signer: ${signer.address}`);

  // --- Configuration ---
  const eventRegistryAddress = deploymentOutput.EventRegistry;
  const eventName = "UFC Fight Night - 0.1 USDC"; // Optional: Changed name
  const eventOrganizer = signer.address;
  const eventPriceUSD = 0.1; // <<< Changed price to 0.1
  const usdcDecimals = 6;
  const maxSupply = 500;
  const isActive = true;
  // --- End Configuration ---

  if (!eventRegistryAddress) {
    console.error("Error: EventRegistry address not found in deployment-output.json");
    process.exit(1);
  }

  const eventPriceWei = ethers.parseUnits(eventPriceUSD.toString(), usdcDecimals);

  console.log(`Connecting to EventRegistry at: ${eventRegistryAddress}`);
  console.log(`Attempting to create event:`);
  console.log(`  Name: ${eventName}`);
  console.log(`  Organizer: ${eventOrganizer}`);
  console.log(`  Price: ${eventPriceUSD} USDC (${eventPriceWei.toString()} wei)`); // Will show 100000 wei
  console.log(`  Max Supply: ${maxSupply}`);
  console.log(`  Is Active: ${isActive}`);

  const EventRegistry = await ethers.getContractFactory("EventRegistry");
  const eventRegistry = EventRegistry.attach(eventRegistryAddress);

  try {
    const tx = await eventRegistry.createEvent(
      eventName,
      eventOrganizer,
      eventPriceWei,
      maxSupply,
      isActive
    );

    console.log(`Transaction sent: ${tx.hash}`);
    console.log("Waiting for transaction confirmation...");

    const receipt = await tx.wait();

    // --- Ethers v6 Log Parsing --- 
    const eventCreatedTopicHash = eventRegistry.getEvent("EventCreated").topicHash;
    const log = receipt?.logs.find(l => 
        l.address === eventRegistryAddress && 
        l.topics[0] === eventCreatedTopicHash
    );

    if (log) {
        const parsedLog = eventRegistry.interface.parseLog({ topics: [...log.topics], data: log.data });
        if (parsedLog && parsedLog.args) {
            const eventId = parsedLog.args.eventId;
            console.log(`\n✅ Event created successfully!`);
            console.log(`   Event ID: ${eventId.toString()}`); // This should be 2 if the last one was 1
            console.log(`   Transaction Hash: ${receipt.hash}`);
            console.log(`   Block Number: ${receipt.blockNumber}`);
            console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
        } else {
             console.log("✅ Transaction confirmed, but log parsing failed. Check Basescan:");
             console.log(`   ${receipt.hash}`);
        }
    } else {
        console.log("✅ Transaction confirmed, but EventCreated log not found. Check Basescan:");
        console.log(`   ${receipt.hash}`);
    }
    // --- End Ethers v6 Log Parsing ---

  } catch (error) {
    console.error("\n❌ Error creating event:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });