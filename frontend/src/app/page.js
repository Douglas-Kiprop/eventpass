'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useReadContracts, useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';

import { contracts } from '../utils/wagmi'; 

const EVENT_REGISTRY_ADDRESS = contracts.eventRegistry.address;
const EVENT_REGISTRY_ABI = contracts.eventRegistry.abi;

const USDC_DECIMALS = 6;

/**
 * @typedef {object} EventDetails
 * @property {number} id
 * @property {string} name
 * @property {string} organizer
 * @property {bigint} price
 * @property {bigint} maxSupply
 * @property {bigint} ticketsSold
 * @property {boolean} isActive
 * @property {string} [imageUrl]
 */

const eventImageMap = {
  0: '/ufc-event.jpg',
};

const HomePage = () => {
  // Destructure address from useAccount and rename to connectedAddress
  const { address: connectedAddress, isConnected } = useAccount(); 
  const [eventCount, setEventCount] = useState(0);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // Define isAdmin state

  const { data: ownerAddress, isLoading: isLoadingOwner } = useReadContract({
    address: EVENT_REGISTRY_ADDRESS,
    abi: EVENT_REGISTRY_ABI,
    functionName: 'owner',
    query: { enabled: isConnected }, 
  });

  useEffect(() => {
    if (isConnected && ownerAddress && connectedAddress) {
      setIsAdmin(ownerAddress.toLowerCase() === connectedAddress.toLowerCase());
    } else {
      setIsAdmin(false); // Reset if not connected or addresses are missing
    }
  }, [isConnected, ownerAddress, connectedAddress]);

  const { data: eventCountData, error: eventCountError, isLoading: isLoadingCount } = useReadContracts({
    contracts: [
      {
        address: EVENT_REGISTRY_ADDRESS,
        abi: EVENT_REGISTRY_ABI,
        functionName: 'getCurrentEventId',
      },
    ],
  });

  useEffect(() => {
    if (eventCountData && eventCountData[0].status === 'success') {
      // Ensure result is treated as BigInt then Number if it's a numerical value
      const currentId = eventCountData[0].result;
      setEventCount(Number(currentId)); 
    } else if (eventCountError) {
      setError(`Failed to fetch event count: ${eventCountError.message}`);
    }
  }, [eventCountData, eventCountError]);

  const eventDetailContracts = React.useMemo(() => {
    if (eventCount === 0 && !isLoadingCount) return [];
    return Array.from({ length: eventCount }, (_, i) => ({
      address: EVENT_REGISTRY_ADDRESS,
      abi: EVENT_REGISTRY_ABI,
      functionName: 'getEventDetails',
      args: [BigInt(i)],
    }));
  }, [eventCount, isLoadingCount]);

  const { data: eventsData, error: eventsError, isLoading: isLoadingDetails } = useReadContracts({
    contracts: eventDetailContracts,
    query: { enabled: eventCount > 0 && eventDetailContracts.length > 0 },
  });

  useEffect(() => {
    if (isLoadingCount || (eventCount > 0 && isLoadingDetails) || (isConnected && isLoadingOwner)) {
      setIsLoading(true);
      return;
    }
    setIsLoading(false);

    if (eventsData) {
      const fetchedEvents = [];
      eventsData.forEach((resultData, index) => { // Renamed 'result' to 'resultData' to avoid conflict
        if (resultData.status === 'success' && Array.isArray(resultData.result)) {
          // IMPORTANT: Verify the order of items returned by your getEventDetails function
          // Assuming: [organizer, price, maxSupply, ticketsSold, isActive, name]
          const eventTuple = resultData.result;
          if (eventTuple.length >= 6) { // Basic check for array length
            const [organizer, price, maxSupply, ticketsSold, isActive, name] = eventTuple;
            fetchedEvents.push({
              id: index,
              name: name,
              organizer: organizer,
              price: typeof price === 'bigint' ? price : BigInt(0), // Ensure price is BigInt
              maxSupply: typeof maxSupply === 'bigint' ? maxSupply : BigInt(0),
              ticketsSold: typeof ticketsSold === 'bigint' ? ticketsSold : BigInt(0),
              isActive: isActive,
              imageUrl: eventImageMap[index] || '/event-placeholder.png',
            });
          } else {
            console.error(`Unexpected structure for event ID ${index}:`, eventTuple);
          }
        } else if (resultData.error) {
          console.error(`Failed to fetch details for event ID ${index}:`, resultData.error);
        }
      });
      setEvents(fetchedEvents);
      setError(null); 
    } else if (eventsError) {
      setError(`Failed to fetch event details: ${eventsError.message}`);
      setEvents([]);
    }
  }, [eventsData, eventsError, isLoadingCount, isLoadingDetails, eventCount, isConnected, isLoadingOwner]);

  if (isLoading) {
    return <p className="text-center mt-10">Loading events...</p>;
  }

  if (error && events.length === 0) { 
    return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-gray-100">Upcoming Events</h1>
        {isAdmin && (
          <Link href="/create-event" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300">
            Create New Event
          </Link>
        )}
      </div>
      
      {error && <p className="text-center mb-4 text-red-400">Note: {error}</p>} 
      
      {events.length === 0 && !error && (
        <p className="text-center mt-10">No events found. Check back soon or create an event!</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {events.map((event) => {
          // Derived state for clarity
          const ticketsAvailable = Number(event.maxSupply) - Number(event.ticketsSold);
          const isAvailableForSale = event.isActive && ticketsAvailable > 0;

          return (
            <div key={event.id} className="border border-gray-700 bg-gray-800 rounded-lg overflow-hidden shadow-2xl hover:shadow-blue-500/50 transition-shadow duration-300 flex flex-col">
              <img 
                src={event.imageUrl} 
                alt={event.name} 
                className="w-full h-56 object-cover" 
                onError={(e) => { e.target.src = '/event-placeholder.png'; }}
              />
              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-2xl font-semibold mb-3 truncate text-gray-100" title={event.name}>{event.name}</h2>
                <p className="text-gray-400 mb-2 text-sm">
                  Price: <span className="font-semibold text-blue-400">{event.price ? formatUnits(event.price, USDC_DECIMALS) : 'N/A'} USDC</span>
                </p>
                <p className="text-gray-400 mb-4 text-sm">
                  Tickets Remaining: <span className="font-semibold text-gray-200">
                    {ticketsAvailable} / {Number(event.maxSupply)}
                  </span>
                </p>
                <div className="mt-auto pt-4">
                  <Link 
                    href={`/event/${event.id}`}  
                    className={`block w-full text-center font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 
                      ${
                        isAvailableForSale
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : `text-white ${event.isActive ? 'bg-red-700 cursor-not-allowed' : 'bg-gray-600 cursor-not-allowed'}`
                      }`}
                  >
                    {
                      isAvailableForSale 
                        ? 'View Details & Buy Ticket' 
                        : (event.isActive ? 'Sold Out' : 'Sale Not Active')
                    }
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {!isConnected && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-yellow-500 text-black text-center text-sm">
          Please <button onClick={() => { alert('Connect wallet (placeholder)'); }} className="underline font-bold">connect your wallet</button> to purchase tickets or view your existing tickets.
        </div>
      )}
    </div>
  );
};

export default HomePage;