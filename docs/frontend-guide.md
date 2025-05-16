# Frontend Guide

## 1. Introduction
   - **Overview of the Next.js application:** The frontend of EventPass is built using Next.js, a popular React framework. This choice enables server-side rendering (SSR) and static site generation (SSG) for performance and SEO benefits, a robust routing system using the App Router, and a rich development experience.
   - **Key Responsibilities:** The frontend is responsible for user interaction, displaying event information, handling wallet connections, initiating transactions with the smart contracts, and providing a seamless user experience for discovering events and purchasing tickets.

## 2. Project Structure (Key Directories in `frontend/src`)
   - **`app/`**: This is the core of the Next.js application using the App Router. Each folder inside `app` typically maps to a URL segment.
     - `layout.js`: Defines the root layout shared across all pages (e.g., header, footer, global context providers).
     - `page.js`: Defines the UI for a specific route segment. For example, `app/page.js` is the homepage, and `app/event/[eventId]/page.js` is the event detail page.
     - `loading.js`: (Optional) Defines a loading UI displayed while a route segment's content is loading.
     - `error.js`: (Optional) Defines an error UI for a route segment.
   - **`components/`**: Contains reusable UI components used throughout the application (e.g., `Header.jsx`, `EventCard.jsx`, `ConnectWalletButton.jsx`). This promotes modularity and code reuse.
   - **`contracts/`**: Contains ABI (Application Binary Interface) files for the deployed smart contracts (e.g., `EventRegistry.json`, `TicketNFT.json`, `PaymentHandler.json`). These JSON files describe the smart contracts' functions and events, allowing the frontend to interact with them.
   - **`utils/`**: Holds utility functions and helper modules (e.g., functions for formatting dates, interacting with Ethers.js/Viem, constants).
   - **`public/`**: Stores static assets like images (`eventpasslogo.svg`, `event-placeholder.png`), favicons, and other files that are served directly from the root of the domain.

## 3. Key Technologies & Libraries
   - **Next.js (App Router):** Used for structuring the application, routing, rendering, and optimizations.
   - **React:** The underlying UI library for building components and managing state.
     - **Hooks (`useState`, `useEffect`, `useContext`):** Used for managing component state, side effects, and sharing data through context.
   - **Tailwind CSS:** A utility-first CSS framework for rapidly styling components directly in the markup.
   - **Ethers.js / Viem:** Libraries for interacting with the Ethereum blockchain. They are used to connect to user wallets, read data from smart contracts, and send transactions (like purchasing tickets).
   - **Wallet Connection (e.g., RainbowKit, Wagmi, Web3Modal):** Libraries that simplify the process of connecting to various Ethereum wallets (MetaMask, Coinbase Wallet, etc.) and managing wallet state.

## 4. Core Functionalities & Implementation Details
   - **Displaying Events:**
     - Fetching event data from the `EventRegistry` smart contract.
     - Rendering event cards on the homepage and potentially search/filter pages.
     - Displaying detailed information on individual event pages (`event/[eventId]/page.js`).
   - **Wallet Connection:**
     - Integrating a wallet connection library (e.g., RainbowKit) to allow users to connect their Ethereum wallets.
     - Displaying connection status and user's wallet address.
   - **Ticket Purchase Process (`event/[eventId]/page.js` and `event/[eventId]/prepare/page.js`):
     - User selects an event and quantity.
     - Frontend checks for prerequisites (e.g., sufficient USDC balance, ETH for gas on Base Sepolia via the `prepare` page).
     - Approval of USDC spending by the `PaymentHandler` contract.
     - Calling the `purchaseTickets` function on the `PaymentHandler` contract.
     - Handling transaction states (pending, success, error) and providing feedback to the user.
   - **Displaying Owned Tickets (`my-tickets/page.js` - if implemented):
     - Fetching tickets owned by the connected user from the `TicketNFT` contract.
     - Displaying ticket details and associated event information.
   - **State Management:**
     - Local component state using `useState`.
     - Global state management (if needed for complex shared state) using React Context API or a dedicated state management library (like Zustand or Redux Toolkit, though Context might be sufficient for this project's scale).

## 5. Environment Variables
   - **`NEXT_PUBLIC_` prefixed variables:** For exposing configuration to the browser (e.g., `NEXT_PUBLIC_EVENT_REGISTRY_CONTRACT_ADDRESS`, `NEXT_PUBLIC_TICKET_NFT_CONTRACT_ADDRESS`, `NEXT_PUBLIC_PAYMENT_HANDLER_CONTRACT_ADDRESS`, `NEXT_PUBLIC_USDC_CONTRACT_ADDRESS`, `NEXT_PUBLIC_CHAIN_ID`).
   - Stored in `.env.local` (not committed to Git) for local development and configured in Vercel for deployment.

## 6. Routing
   - Based on the Next.js App Router file-system based routing.
   - Dynamic routes for event details (e.g., `event/[eventId]`).

## 7. Styling
   - Primarily using Tailwind CSS for utility classes.
   - Global styles (if any) in `src/app/globals.css`.