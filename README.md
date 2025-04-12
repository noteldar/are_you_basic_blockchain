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

## Deployment

To deploy the contracts:

1. Deploy the `BasicGameContract` first, passing:
   - USDT token address
   - Temporary oracle address (can be updated later)
   - Project wallet address

2. Deploy the `GameOracle`, passing:
   - The address of the `BasicGameContract`

3. Update the oracle address in the `BasicGameContract`

## Usage Flow

1. Owner starts a new game with a unique question ID
2. Players place bets using USDT
3. Players submit answers (which are stored as hashes)
4. The oracle validates the answers and determines the winner
5. The contract distributes the winnings automatically

## License

This project is licensed under the MIT License.
