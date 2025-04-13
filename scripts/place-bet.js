// scripts/place-bet.js
const hre = require("hardhat");
const fs = require("fs");

async function main() {
	// Get signers (first is deployer, second will be our player)
	const [deployer, player] = await hre.ethers.getSigners();
	console.log("Player account:", player.address);

	// Read the contract addresses
	let contractAddresses;
	try {
		contractAddresses = JSON.parse(fs.readFileSync("contract-addresses.json", "utf8"));
	} catch (error) {
		console.error("Error reading contract addresses:", error);
		return;
	}

	// Get contract instances
	const TestUSDT = await hre.ethers.getContractFactory("TestUSDT");
	const usdt = TestUSDT.attach(contractAddresses.usdt);

	const BasicGameContract = await hre.ethers.getContractFactory("BasicGameContract");
	const game = BasicGameContract.attach(contractAddresses.game);

	// Mint some USDT to the player
	const playerUsdtAmount = hre.ethers.parseUnits("100", 6); // 100 USDT
	await usdt.mintTestTokens(player.address, playerUsdtAmount);
	console.log(`Minted ${hre.ethers.formatUnits(playerUsdtAmount, 6)} USDT to player ${player.address}`);

	// Check player's USDT balance
	const playerBalance = await usdt.balanceOf(player.address);
	console.log(`Player USDT balance: ${hre.ethers.formatUnits(playerBalance, 6)}`);

	// Approve game contract to spend player's USDT
	const betAmount = hre.ethers.parseUnits("10", 6); // 10 USDT bet
	await usdt.connect(player).approve(contractAddresses.game, betAmount);
	console.log("Player approved game contract to spend USDT");

	// Place bet
	await game.connect(player).placeBet(betAmount);
	console.log(`Player placed bet of ${hre.ethers.formatUnits(betAmount, 6)} USDT`);

	// Check player's new balance
	const newPlayerBalance = await usdt.balanceOf(player.address);
	console.log(`Player's new USDT balance: ${hre.ethers.formatUnits(newPlayerBalance, 6)}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	}); 