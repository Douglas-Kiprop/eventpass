# User Guide

## 1. Introduction
   - Welcome to EventPass! This guide will help you navigate the platform, discover events, and purchase tickets.

## 2. Getting Started
   - **Wallet Setup:**
     - You'll need an Ethereum-compatible wallet (e.g., MetaMask, Coinbase Wallet) configured for the Base Sepolia network.
     - Ensure you have Base Sepolia ETH (for gas fees) and Base Sepolia USDC (for purchasing tickets).
   - **Connecting Your Wallet:**
     - Click the "Connect Wallet" button on the EventPass website.
     - Select your wallet provider and approve the connection.

## 3. Exploring Events
   - **Homepage:** Browse the list of available events.
   - **Event Details:** Click on an event to view more details, including date, time, venue, ticket price, and description.

## 4. Purchasing Tickets
   - **Navigate to Event Page:** Select the event you wish to attend.
   - **Prerequisites (`prepare` page):**
     - The system may guide you to a `prepare` page to ensure you have the necessary Base Sepolia USDC and ETH.
     - Use the provided faucet links if you need to acquire these testnet tokens.
   - **Select Quantity:** Choose the number of tickets you want to purchase.
   - **Approve USDC:** You will be prompted by your wallet to approve the EventPass `PaymentHandler` contract to spend the required amount of your USDC. This is a standard security step for ERC20 token transactions.
   - **Confirm Purchase:** After approval, you will be prompted again by your wallet to confirm the actual ticket purchase transaction.
   - **Transaction Confirmation:** Wait for the transaction to be confirmed on the blockchain. You will receive a notification of success or failure.
   - **Receiving Your NFT Ticket:** Upon successful purchase, an NFT ticket will be minted to your wallet address.

## 5. Viewing Your Tickets (If `my-tickets` page is implemented)
   - Navigate to the "My Tickets" section (if available).
   - View the NFT tickets you own, along with their details.

## 6. Troubleshooting
   - **Transaction Failed:**
     - Check if you have enough Base Sepolia ETH for gas fees.
     - Ensure you have enough Base Sepolia USDC for the ticket price.
     - Verify you approved the correct USDC amount.
   - **Wallet Not Connecting:**
     - Ensure your wallet is unlocked and set to the Base Sepolia network.
     - Try refreshing the page or reconnecting your wallet.