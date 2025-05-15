'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Twitter, Send, MessageSquare, ShieldCheck, Network, Users, Rocket } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection'; // Assuming you created it in src/components
import Image from 'next/image'; // Import Image component

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-10 bg-black/50 backdrop-blur-lg shadow-xl border-b border-gray-800">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold text-white tracking-tight">
          EventPass
        </Link>
        <div className="hidden md:flex space-x-8 items-center">
          <Link href="#features" className="text-gray-400 hover:text-white transition-colors duration-300">Features</Link>
          <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors duration-300">How It Works</Link>
          <Link href="#why-eventpass" className="text-gray-400 hover:text-white transition-colors duration-300">Why EventPass?</Link>
          <Link href="#testimonials" className="text-gray-400 hover:text-white transition-colors duration-300">Testimonials</Link>
          <Link href="#faq" className="text-gray-400 hover:text-white transition-colors duration-300">FAQs</Link>
        </div>
        <Link href="/explore-events"> {/* Added Link wrapper */}
          <button className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Explore Events
          </button>
        </Link>
        {/* Add mobile menu button here later */}
      </div>
    </nav>
  );
};

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-white bg-black overflow-hidden pt-20">
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-black"></div> {/* This ensures a black base if opacity is less than 1 or gradients don't cover fully */} 
        <div
          className="absolute inset-0 opacity-30 animate-aurora" // Class is applied
          style={{
            backgroundImage: `radial-gradient(ellipse at 20% 30%, #581c87 0%, transparent 50%),
                             radial-gradient(ellipse at 80% 70%, #86198f 0%, transparent 50%),
                             radial-gradient(ellipse at 50% 50%, #1e1b4b 0%, transparent 60%)`,
            // backgroundSize: '300% 300%', // Let the animation handle this now
          }}
        ></div>
      </div>
      
      <div className="container mx-auto px-6 text-center z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tighter">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Unlock a New Era of Events.
          </span>
          <br />
          Your Ticket, Your Asset.
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
          Experience the future of event access with EventPass. Secure, transparent, and truly ownable NFT tickets for unforgettable live experiences.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link href="/explore-events"> {/* Added Link wrapper */}
            <button className="px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg">
              Discover Upcoming Events
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const CredibilitySection = () => {
  const partnerLogos = [
    { 
      name: 'Base', 
      src: '/logos/base-logo-in-blue.svg', 
      alt: 'Base Blockchain', 
      icon: null,
      width: 40,  // Adjusted based on SVG viewBox
      height: 40  // Maintain aspect ratio
    },
    { 
      name: 'MetaMask', 
      src: '/logos/MetaMask-icon-fox.svg', 
      alt: 'MetaMask', 
      icon: null,
      width: 40,  // Adjusted based on SVG aspect ratio
      height: 38  // Maintain original proportions
    },
    { 
      name: 'Coinbase Wallet', 
      src: '/logos/coinbase.svg', 
      alt: 'Coinbase Wallet', 
      icon: null,
      width: 40,  // Adjusted to match other logos
      height: 40  // SVG is square
    },
    { 
      name: 'Security Audit Inc.', 
      src: null, 
      alt: 'Security Audit Partner', 
      icon: <ShieldCheck size={40} className="text-purple-400" />
    }
  ];

  return (
    <AnimatedSection id="credibility" className="py-16 md:py-24 bg-black">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-10">
          Powered by Leading Web3 Technology
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
          {partnerLogos.map((logo) => (
            <div key={logo.name} className="opacity-80 hover:opacity-100 transition-opacity duration-300 flex flex-col items-center w-40">
              {logo.icon ? (
                <div className="mb-2 h-10 flex items-center justify-center">{logo.icon}</div>
              ) : (
                <div className="mb-2 h-10 flex items-center justify-center">
                  <Image 
                    src={logo.src} 
                    alt={logo.alt} 
                    width={logo.width} 
                    height={logo.height} 
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              )}
              <span className="text-gray-400 text-sm text-center mt-2">{logo.alt}</span>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
};

const FeaturesSection = () => {
  // Placeholder data for event cards
  const featuredEvents = [
    { id: 4, name: 'Future Sounds Fest', date: 'AUG 20-22', description: 'Experience the next wave of electronic music.', image: '/images/future-sounds-fest.jpg' }, // Updated image path
    { id: 5, name: 'Web3 Innovators Summit', date: 'SEP 15', description: 'Connect with leaders shaping the decentralized future.', image: '/images/web3-innovators-summit.jpg' }, // Updated image path
    { id: 6, name: 'Digital Art Showcase', date: 'OCT 05-07', description: 'Immerse yourself in groundbreaking NFT art.', image: '/images/digital-art-showcase.jpg' }, // Updated image path
  ];

  return (
    <AnimatedSection id="features" className="py-16 md:py-24 bg-black text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 tracking-tight">
          Experience Events, <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Reimagined</span>.
        </h2>
        <p className="text-lg text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Discover unique gatherings, exclusive access, and a new standard for ticketing, all powered by EventPass.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {featuredEvents.map((event) => (
            <div key={event.id} className="bg-gray-900/70 border border-gray-800 rounded-xl shadow-2xl overflow-hidden transform hover:scale-105 hover:shadow-purple-500/30 transition-all duration-300 flex flex-col backdrop-blur-sm">
              {/* <img src={event.image} alt={event.name} className="w-full h-56 object-cover" /> */}
              <div className="relative w-full h-56"> {/* Add a relative container for Image */} 
                <Image 
                  src={event.image} 
                  alt={event.name} 
                  layout="fill" 
                  objectFit="cover" 
                  className="w-full h-full"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-semibold mb-2 text-white">{event.name}</h3>
                <p className="text-sm text-purple-400 font-medium mb-3">{event.date}</p>
                <p className="text-gray-400 text-sm mb-6 flex-grow">{event.description}</p>
                <Link href={`/event/${event.id}/prepare`} className="mt-auto inline-block text-center w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
};

const WhyChooseUsSection = () => {
  const benefits = [
    {
      icon: <Network size={32} className="text-purple-400" />, // Updated icon
      title: 'Decentralized & Transparent',
      description: 'Built on the blockchain for ultimate transparency and trust in every transaction.',
    },
    {
      icon: <ShieldCheck size={32} className="text-purple-400" />, // Updated icon
      title: 'Enhanced Security',
      description: 'Drastically reduce fraud and scalping with verifiable NFT tickets you genuinely own.',
    },
    {
      icon: <Users size={32} className="text-purple-400" />, // Updated icon
      title: 'Community Focused',
      description: 'Join a vibrant community of event-goers, artists, and creators shaping the future of live events.',
    },
    {
      icon: <Rocket size={32} className="text-purple-400" />, // Updated icon
      title: 'Creator Empowered',
      description: 'Easy-to-use tools for organizers to create, manage, and customize NFT-gated events and experiences.',
    },
  ];

  return (
    <AnimatedSection id="why-eventpass" className="py-16 md:py-24 bg-black text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 tracking-tight">
          Why <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-red-500">EventPass</span>?
        </h2>
        <p className="text-lg text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Discover the unique advantages of using EventPass for a seamless, secure, and rewarding event experience.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-gray-900/70 border border-gray-800 rounded-xl p-8 text-center shadow-xl hover:shadow-pink-500/30 transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-700/30 to-pink-700/30 via-gray-800/30 rounded-lg flex items-center justify-center ring-1 ring-purple-500/50 shadow-lg">
                  {benefit.icon}
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">{benefit.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection> // Corrected closing tag here
  );
};

const ReviewSection = () => {
  const testimonials = [
    {
      quote: "EventPass revolutionized how we manage our tech meetups! The NFT ticketing is seamless and our attendees love the exclusivity.",
      name: 'Sarah L.',
      role: 'Tech Meetup Organizer',
      avatar: '/avatar-placeholder-1.png' // Replace with actual avatar paths
    },
    {
      quote: "Finally, a ticketing platform that understands the Web3 space. Secure, transparent, and user-friendly. Highly recommended!",
      name: 'Mike R.',
      role: 'Blockchain Developer',
      avatar: '/avatar-placeholder-2.png'
    },
    {
      quote: "As an artist, EventPass gives me full control over my event ticketing and helps me connect directly with my fans. It's a game-changer.",
      name: 'CryptoCanvas', // Artist pseudonym
      role: 'Digital Artist',
      avatar: '/avatar-placeholder-3.png'
    }
  ];

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-black text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 tracking-tight">
          Loved by <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">Innovators</span> Like You
        </h2>
        <p className="text-lg text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Hear what our community is saying about the future of event access.
        </p>
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-gray-900/70 border border-gray-800 rounded-xl p-8 shadow-xl hover:shadow-purple-500/40 transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm flex flex-col"
            >
              <p className="text-gray-300 italic text-lg mb-6 flex-grow relative">
                <span className='text-4xl text-purple-500 absolute -top-2 -left-4 opacity-50'>“</span>
                {testimonial.quote}
                <span className='text-4xl text-purple-500 absolute -bottom-2 -right-0 opacity-50'>”</span>
              </p>
              <div className="flex items-center mt-auto">
                {/* Placeholder for avatar - replace with actual <img> tag */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold text-xl mr-4">
                  {testimonial.name.substring(0,1)}
                  {/* <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full rounded-full object-cover" /> */}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState(null); // State to track open FAQ item

  const faqs = [
    {
      question: 'What is EventPass and how does it work?',
      answer: (
        <>
          EventPass is a decentralized platform for event ticketing using NFT technology. Organizers can create and manage events, while attendees can purchase NFT tickets that offer true ownership and enhanced security.
          <br /><br />
          Our platform aims to eliminate common ticketing issues like fraud, scalping, and lack of transparency by leveraging the power of blockchain.
        </>
      )
    },
    {
      question: 'How do I buy an NFT ticket?',
      answer: 'Once you find an event you&apos;re interested in, connect your Web3 wallet (like MetaMask or Coinbase Wallet). Ensure you have enough cryptocurrency (e.g., ETH on Base Sepolia testnet for now) to cover the ticket price and any gas fees. Click the "Mint Ticket" or "Buy Ticket" button, approve the transaction in your wallet, and the NFT ticket will be transferred to your address. You can then view it in your wallet or on your "My Tickets" page on EventPass.'
    },
    {
      question: 'What are the benefits of NFT tickets?',
      answer: 'NFT tickets offer several advantages: <ul class="list-disc list-inside space-y-1 mt-2"><li><strong>True Ownership:</strong> You genuinely own your ticket, not just a license to attend.</li><li><strong>Enhanced Security:</strong> Reduces fraud and counterfeiting due to blockchain&apos;s immutability.</li><li><strong>Transparency:</strong> All transactions are recorded on the blockchain.</li><li><strong>Resale Potential:</strong> Depending on event policies, you might be able to resell your ticket on secondary marketplaces.</li><li><strong>Collectibles:</strong> NFT tickets can become digital collectibles or memorabilia.</li></ul>'
    },
    {
      question: 'Which blockchain does EventPass use?',
      answer: 'EventPass is currently built on the Base Sepolia testnet. This allows us to test and refine the platform. We plan to support mainnet Base and potentially other blockchains in the future for live, real-world events.'
    },
    {
      question: 'What if I lose access to my wallet?',
      answer: 'Your NFT tickets are stored in your Web3 wallet. It is crucial to keep your wallet&apos;s seed phrase (recovery phrase) and private keys secure and backed up. Losing access to your wallet means losing access to your NFT tickets, similar to losing physical cash or tickets. EventPass cannot recover tickets if you lose access to your wallet, as we do not control your private keys.'
    },
    {
      question: 'Can I get a refund for my NFT ticket?',
      answer: 'Refund policies are typically set by the event organizers. EventPass, as a platform, facilitates the creation and sale of NFT tickets but does not generally handle refunds directly unless specified. Please check the terms and conditions for each specific event. Some NFT tickets might be resalable on secondary markets if the organizer enables this feature.'
    },
    {
      question: 'How does EventPass prevent scalping?',
      answer: 'While blockchain provides transparency, preventing scalping entirely is complex. EventPass can support organizers in implementing various strategies, such as setting resale royalties, limiting the number of tickets per wallet, or using dynamic pricing models. The transparency of NFT transactions can also help identify and discourage unfair scalping practices.'
    },
    {
      question: 'What are gas fees?',
      answer: 'Gas fees are transaction fees paid to network validators to process and confirm transactions on the blockchain. When you mint or transfer an NFT ticket, a gas fee is required. These fees can vary based on network congestion. EventPass operates on Base Sepolia (a testnet), where gas fees are typically very low or free, but for mainnet transactions, real gas fees will apply.'
    },
    {
      question: 'Is EventPass secure?',
      answer: 'Security is a top priority. Our smart contracts are developed with best practices in mind and we aim to conduct thorough audits before any mainnet deployment. NFT technology itself offers enhanced security over traditional tickets. However, users must also practice good digital security, such as protecting their wallet keys. It&apos;s secure, transparent, and prevents fraud.' // Corrected line
    }
  ];

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-black text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 tracking-tight">
          Frequently Asked <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-red-500">Questions</span>
        </h2>
        <p className="text-lg text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Find answers to common queries about EventPass and NFT ticketing.
        </p>
        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-900/70 border border-gray-800 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-800/50 transition-colors duration-200 focus:outline-none"
              >
                <h3 className="text-xl font-semibold text-white">{faq.question}</h3>
                {/* Placeholder for chevron icon */}
                <span className={`transform transition-transform duration-300 ${openFAQ === index ? 'rotate-180' : 'rotate-0'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-purple-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </button>
              {openFAQ === index && (
                <div className="p-6 border-t border-gray-700">
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


const CTASection = () => {
  return (
    <AnimatedSection 
      id="cta" 
      className="py-16 md:py-24 bg-[#0A0A0A] text-white border-t border-b border-[#0A0A0A]"
    >
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
          Ready to <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">Experience the Future</span>?
        </h2>
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Join EventPass today and unlock a new era of secure, transparent, and unforgettable live experiences. Whether you&apos;re an attendee or an organizer, the revolution starts now.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link 
            href="/explore-events" // Update this link to your actual events page
            className="px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg"
          >
            Explore Events
          </Link>
          <Link 
            href="/create-event" // Update this link to your event creation page or contact form
            className="px-10 py-4 border-2 border-purple-500 text-purple-400 font-bold rounded-xl shadow-lg hover:bg-purple-500/20 hover:text-white transition-all duration-300 transform hover:scale-105 text-lg"
          >
            Become an Organizer
          </Link>
        </div>
      </div>
    </AnimatedSection> // Corrected closing tag here
  );
};

const Footer = () => {
  const socialLinks = [
    { name: 'Twitter', href: '#', icon: <Twitter size={24} /> }, 
    { name: 'Telegram', href: '#', icon: <Send size={24} /> }, // Send icon for Telegram
    { name: 'Discord', href: '#', icon: <MessageSquare size={24} /> } // MessageSquare for Discord, or another choice
  ];

  return (
    <footer id="footer" className="py-12 md:py-16 bg-[#0A0A0A] border-t border-[#0A0A0A] text-gray-400">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-3">EventPass</h3>
            <p className="text-sm mb-4">
              The future of event ticketing, built on transparency and true ownership.
            </p>
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a 
                  key={social.name} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-purple-400 transition-colors duration-300"
                  aria-label={social.name}
                >
                  {social.icon} 
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="#faq" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="/explore-events" className="hover:text-white transition-colors">Explore Events</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} EventPass. All rights reserved. Powered by the Future.</p>
        </div>
      </div>
    </footer>
  );
};


export default function LandingPage() {
  return (
    <div className="bg-black min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <CredibilitySection />
        <FeaturesSection />
        <WhyChooseUsSection />
        <ReviewSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}