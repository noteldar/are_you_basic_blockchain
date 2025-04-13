const hre = require("hardhat");
const fs = require("fs");

async function main() {
	const [deployer] = await hre.ethers.getSigners();
	console.log("Running script with account:", deployer.address);

	// Read the contract addresses
	let contractAddresses;
	try {
		contractAddresses = JSON.parse(fs.readFileSync("contract-addresses.json", "utf8"));
	} catch (error) {
		console.error("Error reading contract addresses:", error);
		return;
	}

	// Get the game contract instance
	const BasicGameContract = await hre.ethers.getContractFactory("BasicGameContract");
	const game = BasicGameContract.attach(contractAddresses.game);

	// Check game state
	const gameState = await game.getGameState();
	console.log("Current game state:", gameState.toString());
	// Game states: 0 = INACTIVE, 1 = ACTIVE, 2 = COMPLETED

	// Get current question ID
	const currentQuestionId = await game.currentQuestionId();
	console.log("Current question ID:", currentQuestionId);

	// Get players
	const players = await game.getPlayers();
	console.log("Players in game:", players);

	// For each player, check if they have submitted an answer
	for (const player of players) {
		const hasSubmitted = await game.hasPlayerSubmittedAnswer(player);
		const betAmount = await game.getPlayerBet(player);
		console.log(`Player ${player}:`);
		console.log(`  Bet amount: ${betAmount.toString()} USDT`);
		console.log(`  Submitted answer: ${hasSubmitted}`);
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	}); 