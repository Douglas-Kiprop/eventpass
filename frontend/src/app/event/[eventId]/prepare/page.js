'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAccount, useReadContract } from 'wagmi';
// import { OnRampButton } from '@coinbase/onchainkit/pay'; // Comment out or remove this line
// import { FundButton } from '@coinbase/onchainkit/fund'; // Remove this line
// import '@coinbase/onchainkit/styles.css'; // Ensure this is removed or remains commented out
import { contracts, targetChain } from '@/utils/wagmi'; // Assuming your wagmi config is in utils

// Your Coinbase Project ID
const COINBASE_PROJECT_ID = '10719d17-77e2-450d-b9ed-0d8c4d0975de';

export default function PrepareEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.eventId ? BigInt(params.eventId) : undefined;
  const { address, isConnected } = useAccount();
  const [showOnramp, setShowOnramp] = useState(false);

  // Fetch minimal event details to display
  const { data: eventDetails, isLoading: isLoadingEventDetails, error: errorEventDetails } = useReadContract({
    address: contracts.eventRegistry.address,
    abi: contracts.eventRegistry.abi,
    functionName: 'getEventDetails',
    args: eventId !== undefined ? [eventId] : undefined,
    chainId: targetChain.id,
    query: {
      enabled: !!eventId && isConnected, // Only run if eventId is valid and user is connected
    },
  });

  useEffect(() => {
    // Automatically show Onramp if user is connected and eventId is present
    if (isConnected && eventId !== undefined) {
      setShowOnramp(true);
    }
  }, [isConnected, eventId]);

  if (!isConnected || !address) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-gray-300">Please connect your wallet to prepare for the event.</p>
      </div>
    );
  }

  if (eventId === undefined) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-red-400">Invalid event ID.</p>
        <Link href="/" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">Go to Homepage</Link>
      </div>
    );
  }

  if (isLoadingEventDetails) {
    return <div className="container mx-auto px-4 py-8 text-center text-gray-300">Loading event information...</div>;
  }

  if (errorEventDetails) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-red-400">Error loading event details: {errorEventDetails.shortMessage || errorEventDetails.message}</p>
        <Link href="/" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">Go to Homepage</Link>
      </div>
    );
  }

  if (!eventDetails || eventDetails.organizer === '0x0000000000000000000000000000000000000000') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-red-400">Event not found.</p>
        {/* Keep original link or update as per overall navigation strategy */}
        <Link href="/" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">Go to Homepage</Link>
      </div>
    );
  }

  // Correctly access event name from the array structure returned by getEventDetails
  // eventDetails structure: [organizer, price, maxSupply, ticketsSold, isActive, name_]
  const eventName = eventDetails && eventDetails[5] ? eventDetails[5] : 'Event'; 
  // Date is not available from getEventDetails, and we are removing it from display
  // const eventDate = 'Date TBD'; // Removed


  return (
    <div className="container mx-auto px-4 py-12 bg-[#0A0A0A] min-h-screen text-gray-100">
      <div className="max-w-2xl mx-auto bg-gray-800 shadow-xl rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2 text-center text-indigo-400">Prepare for Event</h1>
        <div className="mb-6 p-6 bg-gray-700 rounded-md">
          <h2 className="text-2xl font-semibold mb-3 text-center">{eventName}</h2>
        </div>

        <div className="mb-8 p-6 bg-gray-700/50 rounded-lg">
          <h3 className="text-xl font-semibold text-center mb-4 text-indigo-300">Testnet Funds</h3>
          <p className="text-gray-300 mb-4 text-center text-sm">
            You'll need Base Sepolia USDC and Sepolia ETH (for gas) to proceed.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <a 
              href="https://faucet.circle.com/"
              target="_blank" 
              rel="noopener noreferrer" 
              className="block w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md text-center transition duration-150 ease-in-out"
            >
              Get USDC (Base Sepolia)
            </a>
            <a 
              href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
              target="_blank" 
              rel="noopener noreferrer" 
              className="block w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-md text-center transition duration-150 ease-in-out"
            >
              Get ETH (Sepolia)
            </a>
          </div>
          <div className="mt-6 p-3 bg-gray-600/70 rounded-md text-center">
            <p className="text-sm text-yellow-300">
              ✨ <span className="font-semibold">Pro Tip:</span> Use a Coinbase Smart Wallet for sponsored transaction fees!
            </p>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            href={`/event/${eventId}`}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Continue to Event Details & Purchase
          </Link>
        </div>
         <div className="mt-8 text-center">
            {/* Updated Link to go to /explore-events */}
            <Link href="/explore-events" className="text-indigo-400 hover:text-indigo-300 transition duration-150 ease-in-out">
              &larr; Back to All Events
            </Link>
          </div>
      </div>
    </div>
  );
}