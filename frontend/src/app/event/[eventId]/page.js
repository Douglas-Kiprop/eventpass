'use client'; // Mark as Client Component if we need hooks or interactivityy

import { useParams } from 'next/navigation'; // Hook to access route parameters
import Link from 'next/link';
import { useState, useEffect } from 'react'; // Added useState, useEffect
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'; // Added wagmi hooks
import { contracts, targetChain } from '@eventpass/utils/wagmi'; // Import contract details using alias
import { parseUnits, formatUnits } from 'ethers'; // Import ethers utils

export default function EventPage() {
  const params = useParams(); // Get route parameters'
  const eventId = params.eventId ? BigInt(params.eventId) : null; // Extract and convert eventId to BigInt

  // Wagmi hooks
  const { address: connectedAddress, chain } = useAccount(); // Get connected account address and chain
  const { data: hash, error: writeError, isPending: isWritePending, writeContract } = useWriteContract(); // Hook for writing to contracts
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({ hash }); // Hook to wait for transaction confirmation

  // State for purchase flow
  const [purchaseStep, setPurchaseStep] = useState('idle'); // 'idle', 'fetchingPrice', 'approving', 'purchasing', 'success', 'error'
  const [txHash, setTxHash] = useState(null); // Store transaction hash
  const [error, setError] = useState(null); // Store general errors
  const [eventPriceUSDC, setEventPriceUSDC] = useState(null); // Store event price in USDC units
  const [eventPriceWei, setEventPriceWei] = useState(null); // Store event price in wei

  // Fetch event details using useReadContract
  const { data: eventData, isLoading: isEventLoading, error: eventError } = useReadContract({
    address: contracts.eventRegistry.address,
    abi: contracts.eventRegistry.abi,
    functionName: 'getEventDetails',
    args: eventId ? [eventId] : undefined, // Pass eventId only if it exists
    chainId: targetChain.id,
    enabled: !!eventId, // Only run query if eventId is valid
  });

  // Update event price state when data is loaded
  useEffect(() => {
    if (eventData) {
      // eventData structure: [organizer, price, maxSupply, ticketsSold, isActive, name]
      const priceInWei = eventData[1]; // Assuming price is the second element
      setEventPriceWei(priceInWei);
      // Assuming USDC has 6 decimals
      setEventPriceUSDC(formatUnits(priceInWei, 6));
    }
    if (eventError) {
      setError(`Error fetching event details: ${eventError.shortMessage || eventError.message}`);
      setPurchaseStep('error');
    }
  }, [eventData, eventError]);

  // Placeholder for fetching actual event data based on eventId - Replaced by useReadContract
  // const eventDetails = { ... }; // Keep structure for fallback/UI display if needed

  // Update local error state based on wagmi hook errors
  useEffect(() => {
    if (writeError) {
      setError(`Transaction Error: ${writeError.shortMessage || writeError.message}`);
      setPurchaseStep('error');
      setTxHash(null); // Clear hash on error
    }
    if (receiptError) {
      setError(`Receipt Error: ${receiptError.shortMessage || receiptError.message}`);
      setPurchaseStep('error');
      setTxHash(null); // Clear hash on error
    }
  }, [writeError, receiptError]);

   // Update transaction hash state
   useEffect(() => {
    if (hash) {
      setTxHash(hash);
    }
  }, [hash]);

  // Reset state on successful confirmation
  useEffect(() => {
    if (isConfirmed && purchaseStep === 'purchasing') { // Check if it was the purchase step
        setPurchaseStep('success');
        // Optionally reset hash after a delay or user action
        // setTxHash(null);
    }
  }, [isConfirmed, purchaseStep]);


  // --- Purchase Logic ---
  const handlePurchase = async () => {
    if (!connectedAddress) {
      setError("Please connect your wallet first.");
      return;
    }
    if (chain?.id !== targetChain.id) {
        setError(`Please switch to the ${targetChain.name} network.`);
        return;
    }
    if (!eventId || eventPriceWei === null) {
      setError("Event details not loaded or invalid.");
      return;
    }
    if (!eventData || !eventData[4]) { // Check if event is active (index 4)
        setError("This event is not currently active for ticket sales.");
        return;
    }
     if (eventData[3] >= eventData[2]) { // Check if ticketsSold >= maxSupply
        setError("This event is sold out.");
        return;
    }


    setError(null); // Clear previous errors
    setTxHash(null); // Clear previous hash
    setPurchaseStep('approving'); // Start with approval step

    try {
      // 1. Approve USDC spending
      console.log(`Approving ${eventPriceUSDC} USDC for PaymentHandler...`);
      writeContract({
        address: contracts.usdc.address,
        abi: contracts.usdc.abi,
        functionName: 'approve',
        args: [contracts.paymentHandler.address, eventPriceWei],
        chainId: targetChain.id,
      }, {
        onSuccess: (approvalHash) => {
          console.log('Approval transaction sent:', approvalHash);
          setTxHash(approvalHash); // Set hash for waiting receipt
          // Now wait for this approval transaction to confirm
          // The useWaitForTransactionReceipt hook handles this automatically
          // We need a way to know when approval is confirmed to proceed to purchase.
          // We'll use the isConfirmed flag combined with the current step.
        },
        onError: (err) => {
          console.error("Approval failed:", err);
          setError(`Approval failed: ${err.shortMessage || err.message}`);
          setPurchaseStep('error');
        }
      });

    } catch (err) {
      console.error("Error during approval initiation:", err);
      setError(`Initiation failed: ${err.message}`);
      setPurchaseStep('error');
    }
  };

  // Effect to trigger purchase after approval confirmation
  useEffect(() => {
    if (isConfirmed && purchaseStep === 'approving' && txHash) {
      // Approval was successful, now initiate the purchase
      setPurchaseStep('purchasing');
      setTxHash(null); // Reset hash for the next transaction
      console.log('Approval confirmed. Proceeding to purchase...');

      // Generate a simple tokenURI (replace with actual logic if needed)
      const tokenURI = `ipfs://event${eventId}/ticket${Date.now()}`; // Example URI

      writeContract({
        address: contracts.paymentHandler.address,
        abi: contracts.paymentHandler.abi,
        functionName: 'purchaseTicket',
        args: [eventId, connectedAddress, tokenURI], // Mint to connected address
        chainId: targetChain.id,
      }, {
        onSuccess: (purchaseHash) => {
          console.log('Purchase transaction sent:', purchaseHash);
          setTxHash(purchaseHash); // Set hash for waiting receipt
        },
        onError: (err) => {
          console.error("Purchase failed:", err);
          setError(`Purchase failed: ${err.shortMessage || err.message}`);
          setPurchaseStep('error');
        }
      });
    }
  }, [isConfirmed, purchaseStep, txHash, eventId, connectedAddress, writeContract]); // Add dependencies


  // --- Render Logic ---
  const isLoading = isEventLoading || isWritePending || isConfirming;
  const buttonText = () => {
    if (!connectedAddress) return 'Connect Wallet to Purchase';
    if (chain?.id !== targetChain.id) return `Switch to ${targetChain.name}`;
    if (isEventLoading) return 'Loading Event Details...';
    if (eventPriceUSDC === null && !eventError) return 'Fetching Price...';
    if (purchaseStep === 'approving') return isConfirming ? 'Approving USDC...' : 'Approve USDC';
    if (purchaseStep === 'purchasing') return isConfirming ? 'Purchasing Ticket...' : 'Purchase Ticket';
    if (purchaseStep === 'success') return 'Purchase Successful!';
    if (purchaseStep === 'error') return 'Try Again';
    if (!eventData || !eventData[4]) return 'Event Not Active'; // Check isActive flag
    if (eventData && eventData[3] >= eventData[2]) return 'Sold Out'; // Check supply
    return `Purchase Ticket (${eventPriceUSDC || '...'} USDC)`;
  };

  if (!eventId && !isEventLoading) {
    return (
       <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
         <div className="w-full max-w-3xl bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <Link href="/" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">&larr; Back to Home</Link>
            <p className="text-red-500">Invalid Event ID.</p>
         </div>
       </main>
    );
  }

  // Display loading state for event details
  if (isEventLoading) {
     return (
       <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
         <div className="w-full max-w-3xl bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <Link href="/" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">&larr; Back to Home</Link>
            <p>Loading event details...</p>
         </div>
       </main>
    );
  }

  // Display error if event details failed to load
  if (eventError && !eventData) {
     return (
       <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
         <div className="w-full max-w-3xl bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <Link href="/" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">&larr; Back to Home</Link>
            <h1 className="text-3xl font-bold mb-4">Error</h1>
            <p className="text-red-400">Could not load event details for ID: {eventId.toString()}.</p>
            <p className="text-sm text-gray-400 mt-2">{error || eventError.shortMessage || eventError.message}</p>
         </div>
       </main>
    );
  }

  // Main event display
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-3xl bg-gray-800 rounded-lg shadow-lg p-8">
        <Link href="/" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">&larr; Back to Home</Link>

        {/* Display Event Details - Adapt based on your actual eventData structure */}
        <h1 className="text-4xl font-bold mb-4">{(eventData && eventData[5]) ? eventData[5] : `Event #${eventId.toString()}`}</h1>
        <p className="text-lg text-gray-300 mb-2">Organized by: <span className="text-sm font-mono">{(eventData && eventData[0]) ? eventData[0] : 'Loading...'}</span></p>
        <p className="text-xl font-semibold text-green-400 mb-4">Price: {eventPriceUSDC !== null ? `${eventPriceUSDC} USDC` : 'Loading...'}</p>
        <p className="text-gray-400 mb-1">Tickets Sold: {(eventData && typeof eventData[3] !== 'undefined') ? eventData[3].toString() : '...'}</p>
        <p className="text-gray-400 mb-1">Max Supply: {(eventData && typeof eventData[2] !== 'undefined') ? eventData[2].toString() : '...'}</p>
        <p className={`mb-6 ${eventData && eventData[4] ? 'text-green-500' : 'text-red-500'}`}>
          Status: {eventData && typeof eventData[4] !== 'undefined' ? (eventData[4] ? 'Active' : 'Inactive') : 'Loading...'}
        </p>

        {/* Purchase Button and Status Area */} 
        <div className="mt-6">
          {purchaseStep !== 'success' && (
             <button
                onClick={handlePurchase}
                disabled={isLoading || purchaseStep === 'approving' || purchaseStep === 'purchasing' || !connectedAddress || (chain?.id !== targetChain.id) || !eventData || !eventData[4] || (eventData && eventData[3] >= eventData[2])}
                className={`w-full px-6 py-3 rounded-md text-lg font-semibold transition-colors duration-200 ${isLoading || purchaseStep === 'approving' || purchaseStep === 'purchasing' || !connectedAddress || (chain?.id !== targetChain.id) || !eventData || !eventData[4] || (eventData && eventData[3] >= eventData[2])
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                {buttonText()}
              </button>
          )}

          {/* Display Loading/Pending/Success/Error States */} 
          {isLoading && purchaseStep !== 'idle' && purchaseStep !== 'error' && (
            <p className="mt-4 text-center text-yellow-400">{buttonText()}...</p>
          )}

          {txHash && (purchaseStep === 'approving' || purchaseStep === 'purchasing') && (
            <p className="mt-4 text-center text-sm text-gray-400">
              Transaction pending... View on{' '}
              <a href={`${targetChain.blockExplorers.default.url}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                Explorer
              </a>
            </p>
          )}

          {/* --- SUCCESS MESSAGE AND BUTTON --- */} 
          {purchaseStep === 'success' && (
            <div className="mt-6 text-center p-4 border border-green-500 rounded-md bg-green-900/50">
              <p className="text-xl font-semibold text-green-300 mb-3">Purchase Successful!</p>
              {txHash && (
                 <p className="text-sm text-gray-300 mb-4">
                   Transaction confirmed:{' '}
                   <a href={`${targetChain.blockExplorers.default.url}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                     View on Explorer
                   </a>
                 </p>
              )}
              <Link href="/my-tickets">
                <button className="px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors duration-200">
                  View My Tickets
                </button>
              </Link>
            </div>
          )}
          {/* --- END SUCCESS MESSAGE --- */} 

          {error && purchaseStep === 'error' && (
            <p className="mt-4 text-center text-red-400">Error: {error}</p>
          )}
        </div>
      </div>
    </main>
  );
}