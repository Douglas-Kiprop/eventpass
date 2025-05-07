'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For redirecting
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits } from 'viem'; // To convert USDC input to smallest unit

import { contracts } from '../../utils/wagmi'; // Adjusted path

const EVENT_REGISTRY_ADDRESS = contracts.eventRegistry.address;
const EVENT_REGISTRY_ABI = contracts.eventRegistry.abi;
const USDC_DECIMALS = 6; // Assuming USDC has 6 decimals

const CreateEventPage = () => {
  const router = useRouter();
  const { address: connectedAddress, isConnected } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(true);

  const [eventName, setEventName] = useState('');
  const [eventPrice, setEventPrice] = useState(''); // Store as string for input field
  const [maxSupply, setMaxSupply] = useState(''); // Store as string
  const [imageUrl, setImageUrl] = useState('');
  
  const [submissionError, setSubmissionError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const { data: hash, error: writeError, isPending: isWritePending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({ 
    hash 
  });

  // Fetch owner to verify admin status
  const { data: ownerAddress } = useReadContract({
    address: EVENT_REGISTRY_ADDRESS,
    abi: EVENT_REGISTRY_ABI,
    functionName: 'owner',
    query: { enabled: isConnected },
  });

  useEffect(() => {
    if (isConnected && ownerAddress && connectedAddress) {
      const isAdminUser = ownerAddress.toLowerCase() === connectedAddress.toLowerCase();
      setIsAdmin(isAdminUser);
      if (!isAdminUser) {
        // Optional: Redirect non-admins immediately
        // console.log('User is not admin, redirecting...');
        // router.push('/'); 
      }
    } else if (isConnected === false && ownerAddress === undefined) {
      // Still loading or not connected, do nothing yet for admin status
    } else {
        setIsAdmin(false); // Not connected or ownerAddress not fetched
    }
    setIsVerifyingAdmin(false); // Finished admin verification attempt
  }, [isConnected, ownerAddress, connectedAddress, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError(null);
    setSubmissionSuccess(false);

    if (!isAdmin) {
      setSubmissionError('You are not authorized to create events.');
      return;
    }

    if (!eventName || !eventPrice || !maxSupply) {
      setSubmissionError('Please fill in all required fields.');
      return;
    }

    try {
      const priceInSmallestUnit = parseUnits(eventPrice, USDC_DECIMALS);
      const maxSupplyBigInt = BigInt(maxSupply);
      
      // The 'organizer' should be the connected admin's address
      const organizerAddress = connectedAddress; 
      // For now, let's default isActive to true when creating an event
      const isActive = true; 

      // Ensure organizerAddress is valid before proceeding
      if (!organizerAddress) {
        setSubmissionError('Organizer address (your connected address) is not available.');
        return;
      }

      writeContract({
        address: EVENT_REGISTRY_ADDRESS,
        abi: EVENT_REGISTRY_ABI,
        functionName: 'createEvent',
        args: [
          eventName,            // string memory name
          organizerAddress,     // address organizer
          priceInSmallestUnit,  // uint256 price
          maxSupplyBigInt,      // uint256 maxSupply
          isActive              // bool isActive
        ],
      });
    } catch (err) {
      console.error('Error preparing transaction:', err);
      setSubmissionError(`Error: ${err.message || 'Could not prepare transaction.'}`);
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      setSubmissionSuccess(true);
      setEventName('');
      setEventPrice('');
      setMaxSupply('');
      setImageUrl('');
      // Optionally, redirect to the events page or the new event's detail page
      // router.push('/');
    }
  }, [isConfirmed]);

  if (isVerifyingAdmin) {
    return <p className="text-center mt-10">Verifying authorization...</p>;
  }

  if (!isConnected) {
    return <p className="text-center mt-10">Please connect your wallet to create an event.</p>;
  }
  
  // It's better to show a clear message than just a blank page if not admin
  if (!isAdmin && !isVerifyingAdmin) { 
    return <p className="text-center mt-10 text-red-500">Access Denied: You are not authorized to create events.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-100">Create New Event</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-8 rounded-lg shadow-xl">
        <div>
          <label htmlFor="eventName" className="block text-sm font-medium text-gray-300 mb-1">Event Name</label>
          <input 
            type="text" 
            id="eventName" 
            value={eventName} 
            onChange={(e) => setEventName(e.target.value)} 
            className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
            required 
          />
        </div>

        <div>
          <label htmlFor="eventPrice" className="block text-sm font-medium text-gray-300 mb-1">Price (USDC)</label>
          <input 
            type="number" 
            id="eventPrice" 
            value={eventPrice} 
            onChange={(e) => setEventPrice(e.target.value)} 
            className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
            min="0" 
            step="0.000001" // Allows for USDC decimals
            required 
          />
        </div>

        <div>
          <label htmlFor="maxSupply" className="block text-sm font-medium text-gray-300 mb-1">Max Tickets (Supply)</label>
          <input 
            type="number" 
            id="maxSupply" 
            value={maxSupply} 
            onChange={(e) => setMaxSupply(e.target.value)} 
            className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
            min="1" 
            step="1"
            required 
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-1">Image URL (Optional)</label>
          <input 
            type="url" 
            id="imageUrl" 
            value={imageUrl} 
            onChange={(e) => setImageUrl(e.target.value)} 
            placeholder="https://example.com/image.jpg"
            className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button 
          type="submit" 
          disabled={isWritePending || isConfirming || !isAdmin}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center"
        >
          {isWritePending ? 'Sending...' : isConfirming ? 'Confirming Transaction...' : 'Create Event'}
        </button>

        {submissionSuccess && <p className="text-green-400 text-center mt-4">Event created successfully!</p>}
        {submissionError && <p className="text-red-400 text-center mt-4">Error: {submissionError}</p>}
        {writeError && <p className="text-red-400 text-center mt-4">Contract Write Error: {writeError.shortMessage || writeError.message}</p>}
        {receiptError && <p className="text-red-400 text-center mt-4">Transaction Receipt Error: {receiptError.shortMessage || receiptError.message}</p>}
        {hash && <p className="text-gray-400 text-center mt-2 text-xs">Transaction Hash: {hash}</p>}
      </form>
    </div>
  );
};

export default CreateEventPage;