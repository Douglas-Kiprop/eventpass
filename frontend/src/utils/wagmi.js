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

// --- RPC URL Configuration ---

// This was your original RPC URL from environment variables.
// It's not directly used for the Wagmi transport if Paymaster is active for baseSepolia,
// but it's good to keep the environment variable for other potential uses or fallback.
const originalBaseSepoliaRpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL;

if (!originalBaseSepoliaRpcUrl) {
  // This warning is still relevant if you expect this variable to be set for other purposes.
  console.warn("Original Base Sepolia RPC URL (NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL) is not set in environment variables.");
}

// Your Coinbase Paymaster & Bundler Endpoint for Base Sepolia
// CORRECTED: Removed extra backticks and spaces from the string.
const coinbasePaymasterBundlerRpcUrl = 'https://api.developer.coinbase.com/rpc/v1/base-sepolia/0LyroFvbm5BAZqaPEZ5UDGaPp8tKeFP9';

// --- End RPC URL Configuration ---

// Wagmi Configuration
export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'EventPass',
      preference: 'all', // Allows users to choose Smart Wallet or EOA via Coinbase Wallet
    }),
    injected(), // For MetaMask and other browser EOA wallets (usually shown as "Browser Wallet")
    // walletConnect({ projectId: 'YOUR_WALLETCONNECT_PROJECT_ID' }),
  ],
  transports: {
    // Use the Coinbase Paymaster & Bundler endpoint for Base Sepolia.
    // Transactions from compatible Smart Wallets will be eligible for gas sponsorship.
    // Transactions from EOA wallets (like MetaMask via "Browser Wallet") will go through this RPC,
    // but users will pay their own gas.
    [baseSepolia.id]: http(coinbasePaymasterBundlerRpcUrl),
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