'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
// Removed ethers imports as they are replaced by Alchemy SDK for this task
import { Alchemy, Network, Nft } from 'alchemy-sdk'; // <-- Import Alchemy SDK

// ABI import might not be needed here anymore unless used elsewhere
// import TicketNFTAbi from '../../contracts/abi/TicketNFT.json';s
const TICKET_NFT_ADDRESS = '0xe2Bf7529fBF6D7686029bC0E233A36d396f77a70';

// Interfaces remain the same
interface NftMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: { trait_type: string; value: string | number }[];
}

interface OwnedTicket {
  tokenId: string;
  metadata: NftMetadata | null;
  tokenUri: string;
}

// Helper function to resolve IPFS URIs remains the same
const resolveIpfsUri = (ipfsUri: string): string => {
  if (!ipfsUri) return ''; // Handle null/undefined URIs
  if (ipfsUri.startsWith('ipfs://')) {
    return `https://gateway.pinata.cloud/ipfs/${ipfsUri.substring(7)}`;
  }
  // Handle potential gateway URLs already present in metadata,
  if (ipfsUri.startsWith('http://') || ipfsUri.startsWith('https://')) {
    return ipfsUri;
  }
  // Basic fallback if URI format is unexpected
  console.warn(`Unexpected URI format, returning as is: ${ipfsUri}`);
  return ipfsUri;
};

// Configure Alchemy SDK
// Ensure NEXT_PUBLIC_ALCHEMY_API_KEY is set in your .env.local
const alchemySettings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.BASE_SEPOLIA, // Use Base Sepolia network
};
const alchemy = new Alchemy(alchemySettings);

const MyTicketsPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  // Removed publicClient as it's not needed for Alchemy SDK fetch
  const [ownedTickets, setOwnedTickets] = useState<OwnedTicket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isClientMounted, setIsClientMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  // fetchMetadata might still be needed as a fallback if Alchemy doesn't provide it
  const fetchMetadata = useCallback(async (uri: string): Promise<NftMetadata | null> => {
    const resolvedUri = resolveIpfsUri(uri);
    if (!resolvedUri) return null;
    try {
      const response = await fetch(resolvedUri);
      if (!response.ok) {
        console.error(`Failed to fetch metadata from ${resolvedUri}: ${response.statusText}`);
        return null;
      }
      const metadata = await response.json();
      if (typeof metadata === 'object' && metadata !== null && metadata.name && metadata.image) {
        // Ensure image URI is also resolved
        metadata.image = resolveIpfsUri(metadata.image);
        return metadata as NftMetadata;
      }
      console.error(`Invalid metadata structure from ${resolvedUri}`);
      return null;
    } catch (err) {
      console.error(`Error fetching metadata from ${resolvedUri}:`, err);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchOwnedTickets = async () => {
      if (!isClientMounted || !isConnected || !address) {
        if (isClientMounted) setOwnedTickets([]);
        return;
      }

      // Check if API key is loaded
      if (!alchemySettings.apiKey) {
         setError("Alchemy API Key not found. Please check your .env.local file.");
         setIsLoading(false);
         return;
      }

      setIsLoading(true);
      setError(null);
      console.log(`Fetching tickets via Alchemy for address: ${address}`);
      const startTime = Date.now();

      try {
        // Use Alchemy SDK to get NFTs for the owner for the specific contract
        const nftsResponse = await alchemy.nft.getNftsForOwner(address, {
          contractAddresses: [TICKET_NFT_ADDRESS],
          // You can optionally ask Alchemy to refresh metadata, but it might be slower
          // refreshCache: true 
        });

        console.log(`Alchemy found ${nftsResponse.ownedNfts.length} NFTs. (${Date.now() - startTime}ms)`);

        // Process the response from Alchemy
        const tickets: OwnedTicket[] = await Promise.all(
          nftsResponse.ownedNfts.map(async (nft: Nft) => {
            let metadata: NftMetadata | null = null;
            
            // Prioritize Alchemy's parsed metadata if available
            if (nft.name && nft.image?.cachedUrl) { // Use cachedUrl for potentially resolved image
                metadata = {
                    name: nft.name,
                    description: nft.description || '',
                    image: resolveIpfsUri(nft.image.originalUrl || nft.image.cachedUrl), // Prefer original, fallback to cached
                    attributes: nft.raw?.metadata?.attributes || [],
                };
            } else if (nft.raw?.metadata) { // Fallback to raw metadata
                metadata = {
                    name: nft.raw.metadata.name || `Ticket #${nft.tokenId}`,
                    description: nft.raw.metadata.description || '',
                    image: resolveIpfsUri(nft.raw.metadata.image || ''),
                    attributes: nft.raw.metadata.attributes || [],
                };
            } else if (nft.tokenUri) {
                // Fallback to manual fetching if no metadata from Alchemy
                console.warn(`No metadata from Alchemy for ${nft.tokenId}, fetching manually from ${nft.tokenUri}`);
                metadata = await fetchMetadata(nft.tokenUri);
            }

            return {
              tokenId: nft.tokenId,
              tokenUri: nft.tokenUri || '',
              metadata: metadata,
            };
          })
        );

        console.log(`Finished processing tickets. Total time: ${Date.now() - startTime}ms`);
        setOwnedTickets(tickets);

      } catch (err: any) {
        console.error("Error fetching owned tickets via Alchemy:", err);
        // Provide more specific error feedback if possible
        let errMsg = `Failed to fetch tickets: ${err.message || 'Unknown error'}`;
        if (err.message?.includes('API key')) {
            errMsg = "Invalid or missing Alchemy API Key. Please verify it in .env.local.";
        }
        setError(errMsg);
        setOwnedTickets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwnedTickets();

  }, [address, isConnected, isClientMounted, fetchMetadata]); // Dependencies updated

  // Render logic remains largely the same
  if (!isClientMounted) {
    return null; // Or a loading skeleton
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Tickets</h1>

      {!isConnected ? (
        <p>Please connect your wallet to view your tickets.</p>
      ) : isLoading ? (
        <p>Loading your tickets...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : ownedTickets.length === 0 && !isLoading ? (
        <p>You do not own any tickets for this event.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {ownedTickets.map((ticket) => (
            <div key={ticket.tokenId} className="border rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-800">
              {ticket.metadata?.image ? (
                <img
                  // Use the already resolved image URI from metadata
                  src={ticket.metadata.image}
                  alt={ticket.metadata.name || `Ticket #${ticket.tokenId}`}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/event-placeholder.png'; // Ensure fallback exists
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 truncate">
                  {ticket.metadata?.name || `Ticket #${ticket.tokenId}`}
                </h3>
                {ticket.metadata?.description && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                    {ticket.metadata.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">Token ID: {ticket.tokenId}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;