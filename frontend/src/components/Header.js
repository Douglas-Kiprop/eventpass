'use client';

import Link from 'next/link';
// Remove ConnectKitButton import
// import { ConnectKitButton } from 'connectkit'; 
// Import ConnectWallet from OnchainKit
import { ConnectKitButton } from 'connectkit';
// Import useAccount and useEffect for diagnostics
import { useAccount } from 'wagmi';
import { useEffect } from 'react';

export default function Header() {
  const { address, isConnected, connector } = useAccount(); // Get account status from Wagmi

  // Log Wagmi's account state whenever it changes
  useEffect(() => {
    console.log('--- Wagmi Connection State (Header) ---');
    console.log('Is Connected:', isConnected);
    console.log('Address:', address);
    if (connector) {
      console.log('Connector ID:', connector.id);
      console.log('Connector Name:', connector.name);
    }
    console.log('------------------------------------');
  }, [isConnected, address, connector]);

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-xl font-bold hover:text-gray-300">
            EventPass
          </Link>
          <div className="space-x-4">
            <Link href="/" className={`hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium`}>
              Home
            </Link>
            <Link href="/my-tickets" className={`hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium`}>
              My Tickets
            </Link>
          </div>
        </div>
        <div>
          {/* Use ConnectKitButton */}
          <ConnectKitButton />
        </div>
      </nav>
    </header>
  );
}