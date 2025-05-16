# Deployment Guide

## 1. Overview
   - This guide covers the deployment process for both the frontend (Next.js application) and the backend (Solidity smart contracts) of the EventPass project.

## 2. Smart Contract Deployment (Backend)
   - **Prerequisites:**
     - Node.js and npm/yarn installed.
     - A configured Ethereum wallet with Base Sepolia ETH (for gas fees).
     - `.env` file in the `backend/contracts/` directory with `PRIVATE_KEY` (of the deployer wallet) and `BASE_SEPOLIA_RPC_URL` (e.g., from Alchemy or Infura).
   - **Steps:**
     1. Navigate to the `backend/contracts/` directory.
     2. Install dependencies: `npm install` (or `yarn install`).
     3. Compile contracts: `npx hardhat compile`.
     4. Run the deployment script: `npx hardhat run scripts/deploy.js --network base_sepolia` (assuming your Hardhat network is named `base_sepolia`).
     5. **Record Deployed Addresses:** The script should output the addresses of the deployed `EventRegistry`, `TicketNFT`, and `PaymentHandler` contracts. Store these in `deployment-output.json` in the project root or a similar accessible location.

## 3. Frontend Deployment (Vercel)
   - **Prerequisites:**
     - Vercel account.
     - Project pushed to a Git repository (GitHub, GitLab, Bitbucket).
     - Deployed smart contract addresses from the backend deployment step.
   - **Vercel Project Setup:**
     1. Import your Git repository into Vercel.
     2. **Root Directory:** Set to `frontend`.
     3. **Framework Preset:** Should be automatically detected as `Next.js`.
     4. **Build Command:** `next build` (usually default: `npm run build` which executes `next build` from `frontend/package.json`).
     5. **Output Directory:** `.next` (usually default).
     6. **Install Command:** `npm install` (or `yarn install`, usually default).
   - **Environment Variables (in Vercel project settings):**
     - `NEXT_PUBLIC_EVENT_REGISTRY_CONTRACT_ADDRESS`: Address of deployed `EventRegistry`.
     - `NEXT_PUBLIC_TICKET_NFT_CONTRACT_ADDRESS`: Address of deployed `TicketNFT`.
     - `NEXT_PUBLIC_PAYMENT_HANDLER_CONTRACT_ADDRESS`: Address of deployed `PaymentHandler`.
     - `NEXT_PUBLIC_USDC_CONTRACT_ADDRESS`: Address of the USDC token contract on Base Sepolia.
     - `NEXT_PUBLIC_CHAIN_ID`: Chain ID for Base Sepolia (e.g., `84532`).
     - Any other API keys or configuration needed by the frontend.
   - **Deployment Trigger:** Vercel automatically deploys new commits pushed to the connected Git branch (e.g., `main` or `master`).
   - **Custom Domain (Optional):** Configure a custom domain in Vercel settings.

## 4. Post-Deployment Steps
   - **Testing:** Thoroughly test all functionalities on the deployed production environment.
   - **Monitoring:** Set up monitoring and logging for both frontend (Vercel analytics) and potentially backend (blockchain explorers, event listeners).
   - **Faucet Links:** Ensure any links to faucets (like the one on the `prepare` page) are correct for the target network (Base Sepolia).