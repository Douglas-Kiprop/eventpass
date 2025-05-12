'use client'; // Mark as Client Component if we need hooks or interactivityy

import { useParams, useRouter } from 'next/navigation'; // Hook to access route parameters
import Link from 'next/link';
import { useState, useEffect } from 'react'; // Added useState, useEffect
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'; // Added wagmi hooks
import { contracts, targetChain } from '@eventpass/utils/wagmi'; // Import contract details using alias
import { parseUnits, formatUnits } from 'ethers'; // Import ethers utils
import { decodeEventLog } from 'viem'; // Re-add this import

export default function EventPage() {
  const params = useParams(); // Get route parameters'
  const router = useRouter(); // Initialize useRouter
  const eventId = params.eventId ? BigInt(params.eventId) : null; // Extract and convert eventId to BigInt

  // Wagmi hooks
  const { address: connectedAddress, chain } = useAccount(); // Get connected account address and chain
  const { data: hash, error: writeError, isPending: isWritePending, writeContract } = useWriteContract(); // Hook for writing to contracts
  const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({ hash }); // <-- MODIFIED: Destructure 'data' as 'receipt'

  // State for purchase flow
  const [purchaseStep, setPurchaseStep] = useState('idle'); // 'idle', 'fetchingPrice', 'approving', 'purchasing', 'success', 'error'
  const [txHash, setTxHash] = useState(null); // Store transaction hash
  const [error, setError] = useState(null); // Store general errors
  const [eventPriceUSDC, setEventPriceUSDC] = useState(null); // Store event price in USDC units
  const [eventPriceWei, setEventPriceWei] = useState(null); // Store event price in wei
  const [mintedTokenId, setMintedTokenId] = useState(null); // New state for the minted token ID

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
      console.error('Full writeError object:', writeError); // Log the full writeError
      let detailedWriteError = writeError.shortMessage || writeError.message;
      if (writeError.cause && typeof writeError.cause.shortMessage === 'string') {
        detailedWriteError = writeError.cause.shortMessage;
      } else if (writeError.cause && typeof writeError.cause.message === 'string') {
        detailedWriteError = writeError.cause.message;
      }
      setError(`Transaction Error: ${detailedWriteError}`);
      setPurchaseStep('error');
      setTxHash(null); // Clear hash on error
    }
    if (receiptError) {
      console.error('Full receiptError object:', receiptError); // Log the full receiptError
      // Attempt to get a more specific message from receiptError
      let detailedReceiptError = receiptError.shortMessage || receiptError.message;
      
      // Let's try to access nested properties more safely and log them
      if (receiptError.cause) {
        console.log('receiptError.cause:', receiptError.cause);
        if (typeof receiptError.cause.shortMessage === 'string' && receiptError.cause.shortMessage) {
          detailedReceiptError = receiptError.cause.shortMessage;
        } else if (typeof receiptError.cause.message === 'string' && receiptError.cause.message) {
          detailedReceiptError = receiptError.cause.message;
        } else if (receiptError.cause.data && receiptError.cause.data.message) {
          // Sometimes the revert reason is nested deeper, especially with custom errors
          console.log('receiptError.cause.data.message:', receiptError.cause.data.message);
          detailedReceiptError = receiptError.cause.data.message;
        } else if (typeof receiptError.cause === 'string') {
          // If cause itself is a string
          detailedReceiptError = receiptError.cause;
        }
      }

      setError(`Receipt Error: ${detailedReceiptError}`);
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

  // Reset state on successful confirmation & extract tokenId
  useEffect(() => {
    if (isConfirmed && purchaseStep === 'purchasing' && receipt) {
      setPurchaseStep('success');
      // Try to find the TicketPurchased event in the logs
      const eventAbiItem = contracts.paymentHandler.abi.find(
        (item) => item.type === 'event' && item.name === 'TicketPurchased'
      );

      if (eventAbiItem) {
        for (const log of receipt.logs) {
          // Ensure the log is from the PaymentHandler contract
          if (log.address.toLowerCase() === contracts.paymentHandler.address.toLowerCase()) {
            try {
              const decodedLog = decodeEventLog({
                abi: [eventAbiItem], // decodeEventLog expects an array of ABI items
                data: log.data,
                topics: log.topics,
              });

              if (decodedLog.eventName === 'TicketPurchased') {
                // Ensure args exist and tokenId is present
                if (decodedLog.args && typeof decodedLog.args.tokenId !== 'undefined') {
                  const tokenIdFromEvent = decodedLog.args.tokenId;
                  setMintedTokenId(tokenIdFromEvent.toString());
                  console.log('Minted tokenId:', tokenIdFromEvent.toString());
                } else {
                  console.error('TicketPurchased event decoded, but tokenId not found in args:', decodedLog.args);
                }
                break; // Found the event, no need to check other logs
              }
            } catch (e) {
              console.warn('Could not decode a log for TicketPurchased event:', e);
            }
          }
        }
        if (!mintedTokenId && purchaseStep === 'success') { // Check if mintedTokenId was set after loop
            console.warn('Purchase successful, but could not extract minted tokenId from transaction logs.');
        }
      } else {
        console.error('TicketPurchased event ABI not found in PaymentHandler ABI.');
        // Potentially set an error state here if this is critical for UI
      }
    }
  }, [isConfirmed, purchaseStep, receipt, mintedTokenId]); // Added mintedTokenId to dependencies to avoid re-running if already set


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

  // Define the handlePurchase function
  const handlePurchase = async () => {
    if (!connectedAddress) {
      setError('Please connect your wallet.');
      setPurchaseStep('error');
      return;
    }
    if (chain?.id !== targetChain.id) {
      setError(`Please switch to ${targetChain.name} network.`);
      setPurchaseStep('error');
      return;
    }
    if (!eventPriceWei || eventPriceWei <= 0n) { // Use 0n for BigInt comparison
      setError('Event price is not available or invalid.');
      setPurchaseStep('error');
      return;
    }
    if (!eventData || !eventData[4] || (eventData && eventData[3] >= eventData[2])) {
      setError('Event is not available for purchase (inactive or sold out).');
      setPurchaseStep('error');
      return;
    }

    setError(null); // Clear previous errors
    setPurchaseStep('approving'); // Set step to approving

    console.log(`Attempting to approve ${formatUnits(eventPriceWei, 6)} USDC for spender: ${contracts.paymentHandler.address}`);

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
      },
      onError: (err) => {
        console.error("Approval failed:", err);
        setError(`Approval failed: ${err.shortMessage || err.message}`);
        setPurchaseStep('error');
      }
    });
  };


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
              {/* Updated Link to go to the /mint page */}
              {mintedTokenId && eventId && eventData && typeof eventData[5] !== 'undefined' ? (
                <Link 
                  href={`/mint?eventId=${eventId.toString()}&tokenId=${mintedTokenId}&eventName=${encodeURIComponent(eventData[5])}`}
                  className="px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors duration-200"
                >
                  View Your NFT Ticket
                </Link>
              ) : (
                // Fallback if tokenId or eventName isn't available yet, or if there was an issue
                <div className="text-center">
                    <p className="text-yellow-400 mb-2">
                        Successfully purchased! {mintedTokenId ? 'Preparing your ticket link...' : 'Token ID retrieval pending or failed.'}
                    </p>
                    <Link href="/my-tickets" className="px-5 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white font-medium transition-colors duration-200">
                        View All My Tickets (Fallback)
                    </Link>
                </div>
              )}
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