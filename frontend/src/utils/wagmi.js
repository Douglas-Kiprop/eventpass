import { http, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors'; // Import injected connector

// Import ABIs from the local abi directory within frontend
import PaymentHandlerAbi from '../contracts/abi/PaymentHandler.json';
import EventRegistryAbi from '../contracts/abi/EventRegistry.json';
import TicketNFTAbi from '../contracts/abi/TicketNFT.json';
import Erc20Abi from '../contracts/abi/IERC20Minimal.json';

// Deployed Contract Addresses from deployment-output.json
const paymentHandlerAddress = '0x3130eFbf293F51f4D1094C8e3031846aD675ebdc';
const eventRegistryAddress = '0xdCceD31e8746dF9064B8Cb17A52b15461fe2aCFB';
const ticketNFTAddress = '0xe2Bf7529fBF6D7686029bC0E233A36d396f77a70';
const usdcAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Base Sepolia USDC

// --- Get RPC URL from environment variable ---
const baseSepoliaRpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL;

if (!baseSepoliaRpcUrl) {
  console.warn("Base Sepolia RPC URL (NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL) is not set in environment variables. Falling back to public RPC.");
}
// --- End RPC URL --- 

// Wagmi Configuration
export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'EventPass',
      preference: 'smartWalletOnly', // Optional: prioritize Smart Wallets
    }),
    injected(), // Add MetaMask connector
    // walletConnect({ projectId: 'YOUR_WALLETCONNECT_PROJECT_ID' }), // Replace with your Project ID if needed
  ],
  transports: {
    // --- Use environment variable for RPC --- 
    [baseSepolia.id]: http(baseSepoliaRpcUrl || undefined),
    // --- End RPC change --- 
  },
  ssr: true, // Enable SSR support if needed for Next.js
});

// Export contract details for easy use in components/hooks
export const contracts = {
  paymentHandler: {
    address: paymentHandlerAddress,
    abi: PaymentHandlerAbi.abi, // Keep .abi for Hardhat artifacts
  },
  eventRegistry: {
    address: eventRegistryAddress,
    abi: EventRegistryAbi.abi, // Keep .abi for Hardhat artifacts
  },
  ticketNFT: {
    address: ticketNFTAddress,
    abi: TicketNFTAbi.abi, // Keep .abi for Hardhat artifacts
  },
  usdc: {
    address: usdcAddress,
    abi: Erc20Abi, // No .abi for the manually created JSON
  },
};

// Export the specific chain we are using
export const targetChain = baseSepolia;