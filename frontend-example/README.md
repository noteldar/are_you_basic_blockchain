# Frontend Example for Basic Blockchain Game

This is a simple example of how to integrate the Basic Blockchain Game contracts with a web frontend.

## Prerequisites

- MetaMask browser extension
- Running local Hardhat node
- Deployed contracts

## Setup

1. Make sure your local Hardhat node is running:
   ```
   npm run node
   ```

2. In a separate terminal, deploy the contracts to your local node:
   ```
   npm run deploy
   ```

3. Set a question for the game:
   ```
   npm run set-question
   ```

4. Start the game:
   ```
   npm run start-game
   ```

5. Serve the frontend (you can use any static file server), for example:
   ```
   npx serve
   ```

   Then navigate to http://localhost:3000/frontend-example/

## Integrating with Your Own Frontend

To integrate with your own frontend application:

1. Include the contract ABIs in your project:
   - After compiling with `npm run compile`, find the ABIs in the `artifacts` directory
   - Copy the ABI portion from the JSON files for each contract

2. Use the contract addresses from `contract-addresses.json` generated during deployment

3. Initialize your contracts in your frontend code:
   ```javascript
   // Example with ethers.js
   const provider = new ethers.providers.Web3Provider(window.ethereum);
   const signer = provider.getSigner();
   
   const gameContract = new ethers.Contract(gameAddress, gameAbi, provider);
   const connectedGameContract = gameContract.connect(signer);
   ```

4. Interact with the contracts as shown in the example `app.js` file

## Testing the Game Flow

1. Connect your MetaMask to the local Hardhat network (typically http://localhost:8545)
2. Import the private keys of your Hardhat accounts into MetaMask
3. Place a bet using the interface
4. Submit an answer
5. In a terminal, resolve the game:
   ```
   npm run resolve-game
   ```

## Notes

- This is a simplified example for demonstration purposes
- In a production environment, you would need proper error handling and security measures
- The ABIs in this example are simplified; use the full ABIs from your compiled contracts in a real application 