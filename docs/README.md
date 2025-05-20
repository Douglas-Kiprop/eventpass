# EventPass

EventPass is a decentralized application (dApp) for creating and managing event tickets on the blockchain. It combines Solidity smart contracts for secure ticket issuance and transfers with a modern React-based frontend, allowing users to mint, purchase, and verify event passes in a trustless environment.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Project Overview

EventPass enables event organizers to deploy their own ticketing smart contract, mint NFT-based tickets, and allow attendees to purchase or transfer tickets securely on-chain. The frontend interfaces with the contracts to provide a seamless user experience.

## Features

- Deployable Solidity smart contracts for ticket management
- Minting and purchasing of NFT-backed event passes
- Secure on-chain transfers between users
- React-based SPA for interacting with the contracts
- Responsive design for desktop and mobile
- Automated deployment scripts

## Tech Stack

- **Solidity** — Smart contracts for ticket issuance and transfers
- **JavaScript / TypeScript** — Frontend logic and interaction
- **React** — Single-page application framework
- **Ethers.js** — Ethereum library for contract interaction
- **Hardhat** — Development environment for compiling and testing contracts
- **Tailwind CSS** — Utility-first CSS framework
- **Vercel** — Frontend hosting

## Architecture


+----------------+          +----------------+
|   Frontend     | <------> |  Ethereum RPC  |
|  React + Ethers|          |  Provider      |
+----------------+          +----------------+
          |                          |
          v                          v
+----------------+          +----------------+
| Smart Contracts|          |   Hardhat      |
|  (Solidity)    |          |   Network      |
+----------------+          +----------------+


- Frontend communicates with the Ethereum network via Ethers.js.
- Smart Contracts are deployed using Hardhat to a testnet or mainnet.
- Users interact with the dApp through MetaMask or any Web3 wallet.

## Prerequisites

- Node.js >= 14.x
- npm or yarn
- Hardhat
- Ethereum wallet (e.g., MetaMask)

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Douglas-Kiprop/eventpass.git
    cd eventpass
    ```

2.  Install dependencies for contracts and frontend:
    ```bash
    cd contracts && npm install
    cd ../frontend && npm install
    ```

## Usage

### Smart Contracts

1.  Configure your `.env` file with network RPC URL and private key:
    ```env
    RPC_URL="https://..."
    PRIVATE_KEY="0x..."
    ```

2.  Compile and deploy contracts:
    ```bash
    npx hardhat compile
    npx hardhat run scripts/deploy.js --network <network>
    ```

### Frontend

1.  Create a `.env.local` file in `/frontend` with:
    ```env
    NEXT_PUBLIC_CONTRACT_ADDRESS="<deployed_contract_address>"
    NEXT_PUBLIC_RPC_URL="https://..."
    ```

2.  Start development server:
    ```bash
    cd frontend
    npm run dev
    ```

3.  Open `http://localhost:3000` in your browser.

## Running Tests

### Contracts:
```bash
cd contracts
npx hardhat test

Frontend:

cd frontend
npm test

Deployment

- Frontend is deployed automatically to Vercel via GitHub Actions.

- Contracts can be deployed using Hardhat scripts provided in contracts/scripts.

Contributing

Contributions are welcome! Please open issues or submit pull requests with clear descriptions of changes and related tests.

License

This project is licensed under the MIT License. See the LICENSE file for details.

Contact

Author: Douglas Kiprop

Repository: https://github.com/Douglas-Kiprop/eventpass

Website: https://eventpass-three.vercel.app

