'use client'; // Mark as a Client Component for future interactivity

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createCoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { ethers } from 'ethers';

// SDK Initialization Constants
const APP_NAME = 'EventPass';
const APP_LOGO_URL = 'https://example.com/logo.png';
const DEFAULT_CHAIN_ID = 84532; // Base Sepolia
const BASE_SEPOLIA_RPC_URL = 'https://sepolia.base.org';

export default function HomePage() {
  const [connectedAddress, setConnectedAddress] = useState(null); // Renamed state
  const [isConnectingCoinbase, setIsConnectingCoinbase] = useState(false); // Specific state for Coinbase
  const [isConnectingMetaMask, setIsConnectingMetaMask] = useState(false); // Specific state for MetaMask
  const [error, setError] = useState(null);
  const [cbProvider, setCbProvider] = useState(null); // Renamed state for the provider instance
  const [metaMaskProvider, setMetaMaskProvider] = useState(null); // State for MetaMask provider

  // Initialize Coinbase SDK provider and check for MetaMask on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Coinbase SDK
      console.log("Attempting to initialize Coinbase Wallet SDK...");
      try {
        const provider = createCoinbaseWalletSDK({
          appName: APP_NAME,
          appLogoUrl: APP_LOGO_URL,
          darkMode: true,
          overrideIsMetaMask: false, // Important: Keep false to avoid conflicts
          rpcUrl: BASE_SEPOLIA_RPC_URL,
          chainId: DEFAULT_CHAIN_ID
        });
        console.log("Coinbase Wallet Provider instance created:", provider);
        setCbProvider(provider);
        console.log("Coinbase Wallet SDK Provider Initialized.");
      } catch (sdkError) {
        console.error("Detailed Error initializing Coinbase Wallet SDK:", sdkError);
        setError(`Failed to initialize Coinbase SDK: ${sdkError.message || 'Unknown error'}`);
      }

      // Check for MetaMask (EIP-1193 provider)
      if (window.ethereum && window.ethereum.isMetaMask) {
        console.log("MetaMask detected.");
        // We don't need to initialize MetaMask SDK like Coinbase,
        // we just use the injected window.ethereum
        // Optionally wrap it with ethers later if needed
        // setMetaMaskProvider(new ethers.BrowserProvider(window.ethereum));
      } else {
        console.log("MetaMask not detected.");
      }

    } else {
      console.log("Skipping SDK/Provider initialization on server-side.");
    }
  }, []);


  // Function to handle Coinbase Wallet connection request
  const handleConnectCoinbase = async () => { // Renamed function
    if (!cbProvider) {
      setError("Coinbase Wallet SDK not initialized.");
      console.error("Attempted to connect Coinbase before SDK provider was initialized.");
      return;
    }

    setIsConnectingCoinbase(true);
    setError(null);
    setConnectedAddress(null); // Clear any previous connection
    console.log('Attempting to connect wallet via Coinbase Wallet...');

    try {
      const accounts = await cbProvider.request({ method: 'eth_requestAccounts' });

      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setConnectedAddress(address); // Use generic state
        console.log('Coinbase Wallet connected:', address);
      } else {
        throw new Error('No accounts returned from Coinbase Wallet.');
      }
    } catch (err) {
      console.error('Error connecting Coinbase wallet:', err);
      if (err.code === 4001) {
        setError('Coinbase connection request rejected by user.');
      } else {
        setError('Failed to connect Coinbase Wallet. Please ensure it is available and try again.');
      }
    } finally {
      setIsConnectingCoinbase(false);
    }
  };

  // Function to handle MetaMask connection request
  const handleConnectMetaMask = async () => {
    if (typeof window.ethereum === 'undefined' || !window.ethereum.isMetaMask) {
      setError("MetaMask not detected. Please install MetaMask extension.");
      console.error("Attempted to connect MetaMask but it's not available.");
      return;
    }

    setIsConnectingMetaMask(true);
    setError(null);
    setConnectedAddress(null); // Clear any previous connection
    console.log('Attempting to connect wallet via MetaMask...');

    try {
      // Request accounts using the EIP-1193 standard
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setConnectedAddress(address); // Use generic state
        console.log('MetaMask connected:', address);

        // Optional: Listen for account changes
        window.ethereum.on('accountsChanged', (newAccounts) => {
          if (newAccounts.length > 0) {
            setConnectedAddress(newAccounts[0]);
            console.log('MetaMask account changed:', newAccounts[0]);
          } else {
            // Handle disconnection or locked wallet
            setConnectedAddress(null);
            setError('MetaMask disconnected or locked.');
            console.log('MetaMask disconnected or no accounts found.');
          }
        });

        // Optional: Listen for chain changes
        window.ethereum.on('chainChanged', (_chainId) => {
          // Handle chain change, e.g., reload page or prompt user
          console.log('MetaMask chain changed:', _chainId);
          // window.location.reload(); // Simple way to handle it
          setError(`Network changed to ${_chainId}. Please ensure you are on Base Sepolia.`);
        });

      } else {
        throw new Error('No accounts returned from MetaMask.');
      }
    } catch (err) {
      console.error('Error connecting MetaMask wallet:', err);
      if (err.code === 4001) { // EIP-1193 user rejected request error
        setError('MetaMask connection request rejected by user.');
      } else {
        setError(`Failed to connect MetaMask: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsConnectingMetaMask(false);
    }
  };


  // Function to handle wallet disconnection
  const handleDisconnect = () => {
    console.log("Disconnecting wallet...");
    setConnectedAddress(null);
    setError(null); // Clear any previous errors
    // Note: We are not explicitly removing MetaMask event listeners here.
    // They will attempt to reconnect or update state if the user interacts
    // with MetaMask again (e.g., changes account). This is often desired behavior.
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-6">Welcome to EventPass!</h1>
        <p className="text-lg text-gray-300 mb-8">
          Your gateway to exclusive events. Get your NFT ticket seamlessly.
        </p>

        <div className="space-y-4 mb-10">
          {/* Wallet Connection Section */}
          {!connectedAddress ? (
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Coinbase Button */}
              <button
                onClick={handleConnectCoinbase} // Use renamed handler
                disabled={isConnectingCoinbase || !cbProvider || isConnectingMetaMask} // Disable if connecting either or CB SDK not ready
                className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto transition duration-150 ease-in-out ${isConnectingCoinbase || !cbProvider || isConnectingMetaMask ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isConnectingCoinbase ? 'Connecting...' : (cbProvider ? 'Connect Coinbase Wallet' : 'Initializing CB...')}
              </button>

              {/* MetaMask Button */}
              <button
                onClick={handleConnectMetaMask}
                disabled={isConnectingMetaMask || typeof window === 'undefined' || !window.ethereum?.isMetaMask || isConnectingCoinbase} // Disable if connecting either or MM not detected
                className={`bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded w-full sm:w-auto transition duration-150 ease-in-out ${isConnectingMetaMask || typeof window === 'undefined' || !window.ethereum?.isMetaMask || isConnectingCoinbase ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isConnectingMetaMask ? 'Connecting...' : (typeof window !== 'undefined' && window.ethereum?.isMetaMask ? 'Connect MetaMask' : 'MetaMask Not Found')}
              </button>
            </div>
          ) : (
            <div className="p-4 border border-green-500 rounded bg-gray-800 text-center space-y-2">
              <p className="text-green-400 font-semibold">Wallet Connected!</p>
              <p className="text-sm text-gray-300 break-all">{connectedAddress}</p>
              {/* Add Disconnect Button */}
              <button
                onClick={handleDisconnect}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm transition duration-150 ease-in-out"
              >
                Disconnect
              </button>
            </div>
          )}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          {/* Placeholder for Onramp Integration */}
          <div className="p-4 border border-gray-700 rounded bg-gray-800">
            <p className="text-gray-400">USDC Purchase Area - Coming Soon!</p>
            {/* Onramp component will go here */}
          </div>
        </div>

        {/* Get Started Button */}
        <Link href="/event/1"> {/* Linking to event ID 1 for testing */}
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded text-lg transition duration-150 ease-in-out">
            Get Started - View Event
          </button>
        </Link>
      </div>
    </main>
  );
}