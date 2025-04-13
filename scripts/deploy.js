// scripts/deploy.js
const hre = require("hardhat");

async function main() {
	const [deployer] = await hre.ethers.getSigners();
	console.log("Deploying contracts with the account:", deployer.address);

	// Deploy TestUSDT
	const TestUSDT = await hre.ethers.getContractFactory("TestUSDT");
	const usdt = await TestUSDT.deploy();
	await usdt.waitForDeployment();
	console.log("TestUSDT deployed to:", await usdt.getAddress());

	// Use deployer as project wallet for testing
	const ProjectWallet = deployer.address;

	// Deploy GameOracle (we'll set the game contract address after deploying it)
	const GameOracle = await hre.ethers.getContractFactory("GameOracle");
	// Use a temporary address for now, will update later
	const oracle = await GameOracle.deploy(deployer.address);
	await oracle.waitForDeployment();
	console.log("GameOracle deployed to:", await oracle.getAddress());

	// Deploy BasicGameContract with USDT, Oracle, and Project Wallet addresses
	const BasicGameContract = await hre.ethers.getContractFactory("BasicGameContract");
	const game = await BasicGameContract.deploy(
		await usdt.getAddress(),
		await oracle.getAddress(),
		ProjectWallet
	);
	await game.waitForDeployment();
	console.log("BasicGameContract deployed to:", await game.getAddress());

	// Now update the oracle with the correct game contract address
	await oracle.setGameContract(await game.getAddress());
	console.log("Updated oracle with game contract address");

	// Fund some accounts with test USDT for testing
	// Mint 1000 USDT to deployer account for testing
	const mintAmount = hre.ethers.parseUnits("1000", 6); // 1000 USDT with 6 decimals
	await usdt.mintTestTokens(deployer.address, mintAmount);
	console.log("Minted test USDT to deployer");

	// Save contract addresses for frontend
	const fs = require("fs");
	const contractAddresses = {
		usdt: await usdt.getAddress(),
		oracle: await oracle.getAddress(),
		game: await game.getAddress()
	};

	fs.writeFileSync(
		"contract-addresses.json",
		JSON.stringify(contractAddresses, null, 2)
	);
	console.log("Contract addresses saved to contract-addresses.json");

	console.log("Deployment complete!");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});