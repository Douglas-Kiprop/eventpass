'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useReadContract } from 'wagmi';
// import { ShareButton } from '@coinbase/onchainkit/minikit'; // This was the incorrect import
import { useOpenUrl } from '@coinbase/onchainkit/minikit'; // Import useOpenUrl
import '@coinbase/onchainkit/styles.css'; // General OnchainKit styles
import { contracts, targetChain } from '@/utils/wagmi';
import { formatUnits } from 'viem';

// A new component to handle the logic dependent on searchParams
function MintConfirmationContent() {
  const searchParams = useSearchParams();
  const eventIdStr = searchParams.get('eventId');
  const tokenIdStr = searchParams.get('tokenId');
  const eventName = searchParams.get('eventName') || 'Your Event'; // Fallback event name

  const eventId = eventIdStr ? BigInt(eventIdStr) : undefined;
  const tokenId = tokenIdStr ? BigInt(tokenIdStr) : undefined;

  const openUrl = useOpenUrl(); // Initialize the useOpenUrl hook

  // Fetch event details to get the date
  const { data: eventDetails, isLoading: isLoadingEventDetails, error: errorEventDetails } = useReadContract({
    address: contracts.eventRegistry.address,
    abi: contracts.eventRegistry.abi,
    functionName: 'getEventDetails',
    args: eventId !== undefined ? [eventId] : undefined,
    chainId: targetChain.id,
    query: {
      enabled: !!eventId,
    },
  });

  const eventDateTimestamp = eventDetails?.[1]; // Assuming date is the second element in the tuple
  const eventDate = eventDateTimestamp ? new Date(Number(eventDateTimestamp) * 1000).toLocaleDateString() : 'Date TBD';

  if (eventId === undefined || tokenId === undefined) {
    return (
      <div className="text-center text-red-400">
        <p>Missing event or ticket information in the URL.</p>
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block">
          Go to Homepage
        </Link>
      </div>
    );
  }

  if (isLoadingEventDetails) {
    return <p className="text-center text-gray-300">Loading event details...</p>;
  }

  if (errorEventDetails) {
    return <p className="text-center text-red-400">Error loading event details: {errorEventDetails.shortMessage || errorEventDetails.message}</p>;
  }
  
  // Construct the share URL for the event itself (can be used in Warpcast embed)
  // For production, you'd replace localhost with your actual domain
  const eventPageUrl = typeof window !== 'undefined' ? `${window.location.origin}/event/${eventId}` : `/event/${eventId}`;

  const shareContent = {
    text: `🎉 Just minted my NFT ticket for "${eventName}"! \nTicket ID: ${tokenId}\n\nCheck out the event on EventPass! 🎫 #EventPass`,
    embeds: [eventPageUrl], // URL to embed in the Warpcast post
  };

  const handleShareToWarpcast = () => {
    const text = encodeURIComponent(shareContent.text);
    const embedUrl = encodeURIComponent(shareContent.embeds[0]);
    const warpcastUrl = `https://warpcast.com/~/compose?text=${text}&embeds[]=${embedUrl}`;
    openUrl(warpcastUrl);
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 shadow-xl rounded-lg p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-green-400">Mint Successful!</h1>
      
      <div className="bg-gray-700 p-6 rounded-md mb-8">
        <h2 className="text-2xl font-semibold text-indigo-300 mb-4">Your NFT Ticket Details:</h2>
        <p className="text-lg text-gray-200 mb-2">
          <span className="font-medium text-gray-400">Event:</span> {eventName}
        </p>
        <p className="text-lg text-gray-200 mb-2">
          <span className="font-medium text-gray-400">Event ID:</span> {eventIdStr}
        </p>
        <p className="text-lg text-gray-200 mb-2">
          <span className="font-medium text-gray-400">Ticket ID:</span> {tokenIdStr}
        </p>
        <p className="text-lg text-gray-200">
          <span className="font-medium text-gray-400">Event Date:</span> {eventDate}
        </p>
      </div>

      <div className="mb-8 text-center">
        <p className="text-gray-300 mb-3">Share your new ticket with your frens!</p>
        <button
          onClick={handleShareToWarpcast}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
        >
          Share on Warpcast
        </button>
      </div>

      <div className="text-center space-x-4">
        <Link 
          href={`/event/${eventId}`} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-150 ease-in-out"
        >
          View Event
        </Link>
        <Link 
          href="/my-tickets" // Assuming you have or will have a "My Tickets" page
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-150 ease-in-out"
        >
          View My Tickets
        </Link>
      </div>
       <div className="mt-10 text-center">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 transition duration-150 ease-in-out">
            &larr; Back to All Events
          </Link>
        </div>
    </div>
  );
}

export default function MintPage() {
  return (
    <div className="container mx-auto px-4 py-12 bg-gray-900 min-h-screen text-gray-100">
      {/* Suspense is important for pages that use useSearchParams */}
      <Suspense fallback={<div className="text-center text-xl p-8">Loading confirmation...</div>}>
        <MintConfirmationContent />
      </Suspense>
    </div>
  );
}