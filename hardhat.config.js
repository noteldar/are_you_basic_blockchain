require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
      },
      {
        version: "0.8.28",
      }
    ]
  },
  networks: {
    hardhat: {
      chainId: 1337 // Use a local development network
    },
    // Add other networks if needed (e.g., testnet, mainnet)
  },
  paths: {
    artifacts: "./artifacts",
  },
};