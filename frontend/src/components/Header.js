'use client';

import Link from 'next/link';
import { ConnectKitButton } from 'connectkit'; // Import ConnectKitButton

export default function Header() {
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
          <ConnectKitButton /> {/* Use the ConnectKit button */}
        </div>
      </nav>
    </header>
  );
}