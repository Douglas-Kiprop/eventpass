require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Load environment variables

// Retrieve environment variables
const baseSepoliaRpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "";
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY || "";
const basescanApiKey = process.env.BASESCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20", // Ensure this matches the pragma version in your contracts
  networks: {
    hardhat: {
      // Configuration for the local Hardhat Network (optional)
    },
    baseSepolia: { // Changed from base_sepolia
      url: baseSepoliaRpcUrl,
      accounts: deployerPrivateKey ? [deployerPrivateKey] : [],
      chainId: 84532, // Base Sepolia Chain ID
    },
    // Add other networks like mainnet if needed later
    // base_mainnet: {
    //   url: process.env.BASE_MAINNET_RPC_URL || "",
    //   accounts: deployerPrivateKey ? [deployerPrivateKey] : [],
    //   chainId: 8453,
    // }
  },
  etherscan: {
    // Configure Etherscan/Basescan API keys for contract verification
    apiKey: {
      baseSepolia: basescanApiKey,
      // base: "YOUR_BASE_MAINNET_ETHERSCAN_API_KEY" // Add if deploying to Base mainnet
    },
    customChains: [ // Required for Base Sepolia verification
       {
         network: "baseSepolia",
         chainId: 84532,
         urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
         }
       }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000 // Increase timeout for tests if needed
  }
};
