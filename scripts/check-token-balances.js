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

	// Alternative approach: mint more tokens and check events
	const amount = hre.ethers.parseUnits("2000", 6); // 2000 USDT with 6 decimals

	// Set up filter for Transfer events
	const filter = usdt.filters.Transfer();

	// Start listening for events
	console.log("Minting tokens and checking events...");

	// Mint tokens to the deployer
	const tx = await usdt.mintTestTokens(deployer.address, amount);
	await tx.wait();
	console.log(`Minted 2000 USDT to ${deployer.address}`);

	// Check events
	const events = await usdt.queryFilter(filter);
	console.log(`Found ${events.length} Transfer events`);

	// Print the most recent events
	const recentEvents = events.slice(-5);
	for (const event of recentEvents) {
		console.log(`Transfer: From ${event.args[0]} To ${event.args[1]} Amount ${hre.ethers.formatUnits(event.args[2], 6)} USDT`);
	}

	// Alternative approach: try using ERC20 interface
	try {
		const ERC20 = await hre.ethers.getContractFactory("@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20");
		const erc20Token = ERC20.attach(contractAddresses.usdt);

		const balance = await erc20Token.balanceOf(deployer.address);
		console.log(`ERC20 Interface - Balance of ${deployer.address}: ${hre.ethers.formatUnits(balance, 6)} USDT`);
	} catch (error) {
		console.log("Error using ERC20 interface:", error.message);
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	}); 