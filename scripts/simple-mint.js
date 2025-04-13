// scripts/simple-mint.js
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

	// Get USDT address
	const usdtAddress = contractAddresses.usdt;
	console.log("USDT contract address:", usdtAddress);

	// Directly interact with the contract using a minimal ABI
	const usdtAbi = [
		"function mintTestTokens(address to, uint256 amount) external"
	];

	const usdt = new hre.ethers.Contract(usdtAddress, usdtAbi, deployer);

	// Your MetaMask address (replace this with your actual address)
	const yourMetaMaskAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Replace this!

	// List of addresses to mint to
	const mintAddresses = [
		deployer.address,
		"0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat account #1
		"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Hardhat account #0
	];

	// Add your MetaMask address if it's been set
	if (yourMetaMaskAddress !== "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266") {
		mintAddresses.push(yourMetaMaskAddress);
	}

	// Mint tokens to each address
	const amount = hre.ethers.parseUnits("10000", 6); // 10,000 USDT

	for (const address of mintAddresses) {
		try {
			console.log(`Minting 10,000 USDT to ${address}...`);
			const tx = await usdt.mintTestTokens(address, amount);
			await tx.wait();
			console.log(`✅ Successfully minted tokens to ${address}`);
		} catch (error) {
			console.error(`❌ Error minting to ${address}:`, error.message);
		}
	}

	console.log("Minting complete! The tokens should now be visible in MetaMask.");
	console.log("If they don't appear automatically, add the token manually with these details:");
	console.log(`- Token Address: ${usdtAddress}`);
	console.log("- Token Symbol: USDT");
	console.log("- Decimals: 6");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	}); 