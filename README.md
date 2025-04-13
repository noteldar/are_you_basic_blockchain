# Secure Blockchain Betting Game

A secure Solidity smart contract for handling player bets with BEP-20 USDT tokens.

## Overview

This project consists of three main components:

1. **BasicGameContract**: The main contract that handles player bets, answers, and prize distribution.
2. **IGameOracle**: Interface for the off-chain oracle that validates player answers.
3. **GameOracle**: Implementation of the oracle that communicates with the main contract.

## Features

- Securely receive and handle player bets in BEP-20 USDT
- Emit events when games start with unique question IDs
- Store minimal on-chain data (current question ID, player addresses, game state)
- Call external off-chain API (Oracle) to validate player answers securely
- Automatically distribute winnings:
  - 95% to the winner (minus gas fees)
  - 5% to the project wallet

## Smart Contract Details

### BasicGameContract

The main contract for the game. It:
- Accepts player bets in USDT
- Allows players to submit answers
- Distributes winnings to the correct player

### GameOracle

The oracle contract that:
- Validates player answers against the correct answer
- Determines the winner
- Communicates with the main contract

## Security Features

The contracts include several security features:
- Reentrancy protection using OpenZeppelin's `ReentrancyGuard`
- Access control using OpenZeppelin's `Ownable`
- Secure token handling
- Validation for all inputs
- Event emission for important state changes

## Local Development and Testing

### Prerequisites

- Node.js (v14+ recommended)
- npm or yarn
- MetaMask browser extension (for frontend testing)

### Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd are_you_basic_blockchain
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Compile the contracts:
   ```
   npm run compile
   ```

### Running a Local Blockchain

Start a local Hardhat node:
```
npm run node
```

This will start a local blockchain with several pre-funded accounts.

### Deploying Contracts Locally

In a new terminal, deploy the contracts to your local node:
```
npm run deploy
```

This script:
- Deploys the TestUSDT token
- Deploys the Oracle contract
- Deploys the Game contract with TestUSDT
- Links them together
- Mints test USDT to your account
- Saves all contract addresses in `contract-addresses.json`

### Testing the Game Flow

1. Set a question for the game:
   ```
   npm run set-question
   ```

2. Start the game:
   ```
   npm run start-game
   ```

3. Make a player bet:
   ```
   npm run place-bet
   ```

4. Submit an answer:
   ```
   npm run submit-answer
   ```

5. Resolve the game:
   ```
   npm run resolve-game
   ```

### Frontend Integration

A simple frontend example is included in the `frontend-example` directory. See the [Frontend README](frontend-example/README.md) for details on how to integrate with your own frontend.

## Deployment

To deploy the contracts to a testnet or mainnet:

1. Configure your `.env` file with your private keys and RPC URLs
2. Update the hardhat.config.js file to include your network configurations
3. Run the deployment script with the network flag:
   ```
   npx hardhat run scripts/deploy.js --network <network-name>
   ```

## Usage Flow

1. Owner starts a new game with a unique question ID
2. Players place bets using USDT
3. Players submit answers (which are stored as hashes)
4. The oracle validates the answers and determines the winner
5. The contract distributes the winnings automatically

## License

This project is licensed under the MIT License.
