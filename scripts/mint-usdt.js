// scripts/mint-usdt.js
const hre = require("hardhat");
const fs = require("fs");

async function main() {
	// Get signers
	const [deployer] = await hre.ethers.getSigners();
	console.log("Running with account:", deployer.address);

	// Read the contract addresses
	let contractAddresses;
	try {
		contractAddresses = JSON.parse(fs.readFileSync("contract-addresses.json", "utf8"));
	} catch (error) {
		console.error("Error reading contract addresses:", error);
		return;
	}

	// Connect to the TestUSDT contract
	const TestUSDT = await hre.ethers.getContractFactory("TestUSDT");
	const usdt = TestUSDT.attach(contractAddresses.usdt);

	console.log("USDT contract address:", await usdt.getAddress());

	// Addresses to mint to (adding your MetaMask address here)
	const addresses = [
		deployer.address, // Contract owner
		"0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Player account (hardhat account #1)
		"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Hardhat account #0
		// Add your MetaMask address below
		"0x0000000000000000000000000000000000000000" // REPLACE THIS with your MetaMask address
	];

	// Mint 1000 USDT to each address
	const amount = hre.ethers.parseUnits("1000", 6); // 1000 USDT with 6 decimals

	for (const address of addresses) {
		if (address === "0x0000000000000000000000000000000000000000") continue; // Skip if you didn't replace the placeholder

		try {
			// Mint tokens
			const tx = await usdt.mintTestTokens(address, amount);
			await tx.wait();
			console.log(`Minted 1000 USDT to ${address}`);

			// Check balance
			try {
				const balance = await usdt.balanceOf(address);
				console.log(`New balance for ${address}: ${hre.ethers.formatUnits(balance, 6)} USDT`);
			} catch (error) {
				console.error(`Error checking balance for ${address}:`, error.message);
			}
		} catch (error) {
			console.error(`Error minting to ${address}:`, error.message);
		}
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	}); 