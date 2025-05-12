import { http, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected } from '@wagmi/connectors';

// Import ABIs
import PaymentHandlerAbi from '../contracts/abi/PaymentHandler.json';
import EventRegistryAbi from '../contracts/abi/EventRegistry.json';
import TicketNFTAbi from '../contracts/abi/TicketNFT.json';
import Erc20Abi from '../contracts/abi/IERC20Minimal.json';

// Deployed Contract Addresses
const paymentHandlerAddress = '0x3130eFbf293F51f4D1094C8e3031846aD675ebdc';
const eventRegistryAddress = '0xdCceD31e8746dF9064B8Cb17A52b15461fe2aCFB';
const ticketNFTAddress = '0xe2Bf7529fBF6D7686029bC0E233A36d396f77a70';
const usdcAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Base Sepolia USDC

// Coinbase Paymaster & Bundler RPC URL
const coinbasePaymasterBundlerRpcUrl = 'https://api.developer.coinbase.com/rpc/v1/base-sepolia/0LyroFvbm5BAZqaPEZ5UDGaPp8tKeFP9';

// Define the target chain
export const targetChain = baseSepolia;
export const BASE_SEPOLIA_CHAIN_ID = baseSepolia.id;

// Consolidated Wagmi Configuration
// This single 'wagmiConfig' should be imported and used throughout your application.
export const wagmiConfig = createConfig({
  chains: [targetChain],
  connectors: [
    coinbaseWallet({ // Add coinbaseWallet back
      appName: 'EventPass DApp',
      preference: 'all', 
    }),
    injected({ 
      shimDisconnect: true,
    }),
  ],
  transports: {
    [targetChain.id]: http(coinbasePaymasterBundlerRpcUrl),
  },
  ssr: true,
});

// Export contract details
export const contracts = {
  paymentHandler: {
    address: paymentHandlerAddress,
    abi: PaymentHandlerAbi.abi,
  },
  eventRegistry: {
    address: eventRegistryAddress,
    abi: EventRegistryAbi.abi,
  },
  ticketNFT: {
    address: ticketNFTAddress,
    abi: TicketNFTAbi.abi,
  },
  usdc: {
    address: usdcAddress,
    abi: Erc20Abi, // Assuming Erc20Abi is the ABI array itself, not an object like { abi: [...] }
  },
};

// Remove the old 'config' export if it was different from 'wagmiConfig'
// Ensure your application (e.g., in providers.js) imports 'wagmiConfig' from this file.
