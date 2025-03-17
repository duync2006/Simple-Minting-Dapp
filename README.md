# Simple NFT Minting dApp

A complete decentralized application for minting NFTs with metadata. This project includes a smart contract, backend service, and frontend interface.

## Project Structure

- `contracts/`: Solidity smart contracts
- `scripts/`: Deployment scripts
- `database/`: Database setup
- `backend/`: Metadata and minting status service
- `frontend/`: Next.js frontend application

## Features

- ERC-721 NFT smart contract with:
  - Minting with metadata
  - Access control
  - Mint limit per address
  - Pausable minting
  - Maximum supply
- Backend service with:
  - Metadata storage and retrieval
  - Minting statistics
  - Rate limiting
  - Input validation
- Frontend interface with:
  - Wallet integration
  - NFT minting form
  - NFT gallery
  - Minting status display
  - Transaction history/ Transaction Details

## Setup Instructions
### Prerequisites
- Node.js (v18+)
- npm
- Hardhat
- MetaMask or another Ethereum wallet

### Smart Contract Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Compile the smart contract:
   ```bash
   npx hardhat compile
   ```

3. Run tests:
   ```bash
   npx hardhat test
   ```

4. Deploy to a local network:
   ```bash
   npx hardhat node
   npx hardhat run scripts/deploy.ts --network localhost
   ```
5. Run smart contract tests:
   ```bash
   npx hardhat test
   ```

6. Deploy to local Hardhat node:
   ```bash
   # Start a local Hardhat node in a separate terminal
   npx hardhat node
   
   # Deploy the contract to the local network
   npx hardhat run scripts/deploy.ts --network localhost
   ```
7. Solidity documentation available at [here](https://github.com/your-username/nft-minting-app/blob/main/docs/SimpleNFT.md)

### Database Setup

1. Navigate to the database directory:
   ```bash
   cd database
   ```

2. Docker Compose Setup:
   ```bash
   docker-compose up -d
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   # Create a .env file with the following content:
   DATABASE_URL=mongodb://admin:admin@localhost:27017/nft-minting-app
   DATABASE_USER=admin
   DATABASE_PASSWORD=admin
   PORT=5000
   CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"  #Replace with your deployed contract address 
   RPC_URL="http://127.0.0.1:8545"
   FAUCET_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
   ```
Note: You can not change CONTRACT_ADDRESS if firstly deploy contract in hardhat node. The address was same.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The API Documentation will be available at `http://localhost:5000/api/docs`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   # Create a .env.local file with the following content:
   NEXT_PUBLIC_CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"  #Replace with your deployed contract address
   NEXT_PUBLIC_API_URL="http://localhost:5000/api"
   ```
Note: You can not change CONTRACT_ADDRESS if firstly deploy contract in hardhat node. The address was same.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The frontend will be available at `http://localhost:3000`

## Security Considerations

- The smart contract implements access control to restrict admin functions
- Input validation is used throughout the application
- Rate limiting is implemented on the backend
- The frontend validates user input before submission

## Documentation

- [Solidity Documentation](https://github.com/your-username/nft-minting-app/blob/main/docs/SimpleNFT.md)
- [API Documentation](http://localhost:5000/api/docs)

