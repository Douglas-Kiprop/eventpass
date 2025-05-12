'use client';

import React from 'react';
import Link from 'next/link';

// Placeholder data for events - we'll fetch this dynamically later
const sampleEvents = [
  {
    id: '1',
    name: 'Future Sounds Fest',
    date: 'AUG 20-22, 2024',
    location: 'Metaverse Arena',
    description: 'Experience the next wave of electronic music with top DJs and immersive visuals.',
    image: '/event-placeholder.png', // Replace with actual image path
    price: '0.05 ETH'
  },
  {
    id: '2',
    name: 'Web3 Innovators Summit',
    date: 'SEP 15, 2024',
    location: 'Decentraland Conference Hall',
    description: 'Connect with leaders shaping the decentralized future. Keynotes, workshops, and networking.',
    image: '/event-placeholder.png', // Replace with actual image path
    price: 'FREE'
  },
  {
    id: '3',
    name: 'Digital Art Showcase',
    date: 'OCT 05-07, 2024',
    location: 'Crypto Art Gallery (Online)',
    description: 'Immerse yourself in groundbreaking NFT art from renowned and upcoming digital artists.',
    image: '/event-placeholder.png', // Replace with actual image path
    price: 'Varies'
  },
  {
    id: '4',
    name: 'Indie Game Developers Meetup',
    date: 'NOV 10, 2024',
    location: 'The Sandbox Hub',
    description: 'Showcase your game, get feedback, and network with fellow indie developers in the web3 space.',
    image: '/event-placeholder.png', // Replace with actual image path
    price: '0.01 ETH'
  }
];

const EventCard = ({ event }) => {
  return (
    <div className="bg-gray-800/70 border border-gray-700 rounded-xl shadow-2xl overflow-hidden transform hover:scale-105 hover:shadow-purple-500/40 transition-all duration-300 flex flex-col backdrop-blur-sm">
      <img src={event.image} alt={event.name} className="w-full h-56 object-cover" />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-semibold mb-2 text-white">{event.name}</h3>
        <p className="text-sm text-purple-400 font-medium mb-1">{event.date}</p>
        <p className="text-xs text-gray-500 mb-3">{event.location}</p>
        <p className="text-gray-400 text-sm mb-6 flex-grow leading-relaxed">{event.description}</p>
        <div className="flex justify-between items-center mt-auto">
          <p className="text-xl font-bold text-white">{event.price}</p>
          <Link 
            href={`/explore-events/${event.id}`} // Link to individual event page (to be created)
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
          >
            View Event
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function ExploreEventsPage() {
  return (
    <div className="min-h-screen bg-black text-white py-12 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            Explore <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">Upcoming Events</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Discover a diverse range of events, from music festivals to tech conferences, all ticketed as NFTs.
          </p>
        </header>

        {/* Placeholder for Search and Filter Bar - to be added later */}
        {/* <div className="mb-10 p-6 bg-gray-800/50 rounded-xl shadow-lg backdrop-blur-md">
          <p className="text-center text-gray-300">Search and Filter Bar Placeholder</p>
        </div> */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {/* Placeholder for Pagination - to be added later */}
        {/* <div className="mt-16 text-center">
          <p className="text-gray-300">Pagination Placeholder</p>
        </div> */}
      </div>
    </div>
  );
}