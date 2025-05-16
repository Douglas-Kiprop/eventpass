# Project Overview: EventPass

## 1. Introduction
   - Purpose of EventPass (e.g., decentralized event ticketing platform).
   - Key features and functionalities (e.g., event creation, ticket purchasing, NFT-based tickets, USDC payments).
   - Target audience (event organizers, attendees).

## 2. Technology Stack
   - **Frontend:** Next.js, React, Tailwind CSS, Ethers.js/Viem, WalletConnect/RainbowKit.
   - **Backend (Smart Contracts):** Solidity, Hardhat, OpenZeppelin Contracts.
   - **Blockchain:** Base Sepolia Testnet (or other target networks).
   - **Deployment:** Vercel (for frontend), manual script (for smart contracts).

## 3. Architecture
   - High-level diagram (if possible, or describe the components).
   - Interaction between frontend, smart contracts, and users.
   - Data flow (e.g., how event data is stored and retrieved, how ticket purchases are processed).

## 4. Core Concepts
   - NFT Tickets: Explain how tickets are represented as NFTs.
   - Event Registry: Role of the `EventRegistry.sol` contract.
   - Payment Handling: Role of the `PaymentHandler.sol` contract and USDC integration.
   - Ticket Management: Role of the `TicketNFT.sol` contract.