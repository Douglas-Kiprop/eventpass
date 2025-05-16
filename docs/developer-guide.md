# Developer Guide

## 1. Introduction
   - This guide provides instructions for developers looking to set up the EventPass project locally, understand its codebase, and contribute.

## 2. Prerequisites
   - Git
   - Node.js (v18 or later recommended) & npm/yarn
   - A code editor (e.g., VS Code)
   - An Ethereum wallet (e.g., MetaMask) for testing interactions.

## 3. Project Setup
   - **Clone the Repository:**
     ```bash
     git clone <repository-url>
     cd eventpass
     ```
   - **Backend (Smart Contracts) Setup:**
     1. Navigate to `backend/contracts/`.
     2. Install dependencies: `npm install`.
     3. Create a `.env` file based on `.env.example` (if provided) or add:
        ```env
        BASE_SEPOLIA_RPC_URL="<your_base_sepolia_rpc_url>"
        PRIVATE_KEY="<your_deployer_private_key>"
        # Optional: ETHERSCAN_API_KEY for contract verification
        ```
     4. Compile contracts: `npx hardhat compile`.
     5. Run a local Hardhat node (for isolated testing):
        ```bash
        npx hardhat node
        ```
     6. Deploy to local Hardhat node (in a separate terminal):
        ```bash
        npx hardhat run scripts/deploy.js --network localhost
        ```
        (Update `deployment-output.json` or frontend env with these local addresses).
   - **Frontend Setup:**
     1. Navigate to `frontend/`.
     2. Install dependencies: `npm install`.
     3. Create a `.env.local` file and add the necessary environment variables (contract addresses from your local deployment or a shared testnet deployment, chain ID for localhost is typically `31337`):
        ```env
        NEXT_PUBLIC_EVENT_REGISTRY_CONTRACT_ADDRESS="<address_from_local_or_testnet_deployment>"
        NEXT_PUBLIC_TICKET_NFT_CONTRACT_ADDRESS="<address_from_local_or_testnet_deployment>"
        NEXT_PUBLIC_PAYMENT_HANDLER_CONTRACT_ADDRESS="<address_from_local_or_testnet_deployment>"
        NEXT_PUBLIC_USDC_CONTRACT_ADDRESS="<usdc_address_on_localhost_or_testnet>"
        NEXT_PUBLIC_CHAIN_ID="31337" # For Hardhat local node, or 84532 for Base Sepolia
        ```
     4. Run the development server:
        ```bash
        npm run dev
        ```
     5. Open `http://localhost:3000` in your browser.

## 4. Running Tests
   - **Smart Contract Tests:**
     - Navigate to `backend/contracts/`.
     - Run: `npx hardhat test`.
   - **Frontend Tests (If implemented):**
     - Navigate to `frontend/`.
     - Run: `npm test` (or the configured test script).

## 5. Codebase Overview
   - Refer to `frontend-guide.md` and `backend-guide.md` for detailed structure.
   - **Key Frontend Areas:** `frontend/src/app/` (pages), `frontend/src/components/` (UI), `frontend/src/contracts/` (ABIs), `frontend/src/utils/` (helpers).
   - **Key Backend Areas:** `backend/contracts/contracts/` (Solidity files), `backend/contracts/scripts/` (deployment), `backend/contracts/test/` (tests).

## 6. Contribution Guidelines
   - **Branching Strategy:** (e.g., feature branches, gitflow).
   - **Code Style:** (e.g., ESLint, Prettier configurations are in place, follow existing patterns).
   - **Commit Messages:** (e.g., Conventional Commits).
   - **Pull Requests:** (e.g., require reviews, link to issues).
   - **Testing:** Ensure new features are covered by tests.

## 7. Adding New Features
   - **Smart Contracts:**
     - Define requirements.
     - Write/modify Solidity code in `backend/contracts/contracts/`.
     - Write tests in `backend/contracts/test/`.
     - Update deployment scripts if necessary.
   - **Frontend:**
     - Create new pages/components in `frontend/src/app/` or `frontend/src/components/`.
     - Implement UI and logic.
     - Interact with smart contracts using Ethers.js/Viem and ABIs.
     - Add environment variables if needed.
     - Write tests (if applicable).