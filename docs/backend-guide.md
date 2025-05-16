# Backend Guide (Smart Contracts)

## 1. Introduction
   - **Overview:** The backend of EventPass consists of Solidity smart contracts deployed on an Ethereum-compatible blockchain (e.g., Base Sepolia Testnet). These contracts manage event creation, ticket minting, and payment processing in a decentralized manner.
   - **Technology Stack:** Solidity (for writing smart contracts), Hardhat (for development, testing, and deployment), OpenZeppelin Contracts (for secure, reusable contract components).

## 2. Smart Contracts Overview
   - **`EventRegistry.sol`:**
     - **Purpose:** Manages the creation and listing of events. It acts as a central registry where event organizers can publish their events.
     - **Key Functions:**
       - `createEvent(name, date, venue, ticketPrice, totalTickets, organizerName, metadataURI)`: Allows an organizer to create a new event. Stores event details on the blockchain.
       - `getEvent(eventId)`: Retrieves details for a specific event.
       - `getAllEvents()`: Retrieves a list of all created events.
     - **Key State Variables:** Stores event data (name, date, price, total supply, tickets sold, organizer, metadata URI, etc.).
   - **`TicketNFT.sol`:**
     - **Purpose:** An ERC721 (or ERC1155) compliant contract that represents event tickets as Non-Fungible Tokens (NFTs). Each NFT is unique and proves ownership of a ticket for a specific event.
     - **Key Functions:**
       - `mintTicket(to, eventId, tokenId)`: Mints a new ticket NFT to a buyer. Typically called by the `PaymentHandler` contract upon successful payment.
       - `ownerOf(tokenId)`: Returns the owner of a specific ticket NFT.
       - `balanceOf(owner)`: Returns the number of tickets owned by an address.
       - `tokenURI(tokenId)`: Returns a URI pointing to the metadata for a specific ticket NFT (which can include event details, seat information, image, etc.).
     - **Inheritance:** Likely inherits from OpenZeppelin's `ERC721.sol` or `ERC1155.sol` and `Ownable.sol` (or similar access control).
   - **`PaymentHandler.sol`:**
     - **Purpose:** Handles the logic for purchasing tickets. It interacts with the `EventRegistry` (to verify event details and price), an ERC20 token contract (like USDC, for payments), and the `TicketNFT` contract (to mint tickets).
     - **Key Functions:**
       - `purchaseTickets(eventId, quantity)`: Allows a user to buy tickets. This function would:
         1. Verify the event exists and has available tickets (`EventRegistry`).
         2. Calculate the total price.
         3. Transfer the required amount of USDC from the buyer to the contract (or directly to the organizer/treasury, requiring prior USDC approval from the buyer to this `PaymentHandler` contract).
         4. Mint the corresponding ticket NFTs to the buyer (`TicketNFT`).
         5. Update the number of tickets sold for the event (`EventRegistry`).
     - **Key State Variables:** Addresses of the `EventRegistry`, `TicketNFT`, and `USDC` token contracts.
     - **Integration:** Requires users to approve the `PaymentHandler` contract to spend their USDC tokens before calling `purchaseTickets`.

## 3. Development Environment
   - **Hardhat:** Used for compiling contracts, running local blockchain nodes (Hardhat Network), writing tests, and scripting deployments.
     - `hardhat.config.js`: Configuration file for Hardhat (networks, Solidity compiler version, etc.).
   - **Solidity:** The programming language for writing smart contracts.
   - **OpenZeppelin Contracts:** A library of secure and audited smart contract components (e.g., `ERC721`, `Ownable`, `SafeMath`).

## 4. Testing
   - **Framework:** Hardhat uses Mocha and Chai for testing (e.g., in the `contracts/test/` directory).
   - **Types of Tests:** Unit tests for individual contract functions, integration tests for interactions between contracts.
   - **Importance:** Crucial for ensuring contract correctness and security due to the immutable nature of deployed smart contracts.

## 5. Deployment
   - **Scripts:** Deployment scripts are typically written in JavaScript or TypeScript and run using Hardhat (e.g., `scripts/deploy.js`).
   - **Process:** The script compiles the contracts and deploys them to the chosen network (e.g., Base Sepolia).
   - **Output:** The deployment script outputs the addresses of the deployed contracts, which are then used in the frontend configuration (`deployment-output.json` is a good practice).
   - **Considerations:** Managing deployer accounts, gas fees, network configurations.

## 6. Key Concepts Explained
   - **ERC20:** A standard interface for fungible tokens on Ethereum (like USDC). It defines common functions like `transfer`, `approve`, `balanceOf`.
   - **ERC721:** A standard interface for Non-Fungible Tokens (NFTs). Each token is unique and has a distinct owner.
   - **Smart Contract Interaction:** How contracts call functions on other contracts (e.g., `PaymentHandler` calling `TicketNFT.mintTicket()`).
   - **Gas Fees:** Fees paid in the native currency (e.g., ETH on Base Sepolia) to execute transactions and deploy contracts on the blockchain.
   - **Immutability:** Once a smart contract is deployed, its code generally cannot be changed. Upgradability patterns exist but add complexity.
   - **Security Considerations:** Common vulnerabilities (reentrancy, integer overflow/underflow), importance of audits, using established libraries like OpenZeppelin.