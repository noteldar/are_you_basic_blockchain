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

	// Read the question info
	let questionInfo;
	try {
		questionInfo = JSON.parse(fs.readFileSync("question-info.json", "utf8"));
	} catch (error) {
		console.error("Error reading question info:", error);
		return;
	}

	// Get the game contract instance
	const BasicGameContract = await hre.ethers.getContractFactory("BasicGameContract");
	const game = BasicGameContract.attach(contractAddresses.game);

	// Get the oracle contract instance
	const GameOracle = await hre.ethers.getContractFactory("GameOracle");
	const oracle = GameOracle.attach(contractAddresses.oracle);

	// Check game state
	const gameState = await game.getGameState();
	console.log("Current game state:", gameState.toString());
	// Game states: 0 = INACTIVE, 1 = ACTIVE, 2 = COMPLETED

	if (gameState.toString() === "1") { // ACTIVE
		console.log("Game is active, resolving with a random winner...");

		// Get the list of players
		const players = await game.getPlayers();

		if (players.length > 0) {
			// Use the first player as the winner to close the game
			const winner = players[0];
			console.log("Resolving game with winner:", winner);

			// Resolve the game with this winner
			try {
				const tx = await oracle.resolveWithWinner(questionInfo.questionId, winner);
				await tx.wait();
				console.log("Game resolved successfully!");
			} catch (error) {
				console.error("Error resolving game:", error.message);
				return;
			}
		} else {
			console.log("No players in the game, cannot resolve.");
			return;
		}
	}

	// Generate a new question ID
	const newQuestionId = hre.ethers.utils.id("question" + Math.floor(Math.random() * 1000));
	console.log("Generated new question ID:", newQuestionId);

	// Update the question-info.json file
	questionInfo.questionId = newQuestionId;
	fs.writeFileSync("question-info.json", JSON.stringify(questionInfo, null, 2));

	// Start a new game
	console.log("Starting new game with question ID:", newQuestionId);
	try {
		const tx = await game.startGame(newQuestionId);
		await tx.wait();
		console.log("New game started successfully!");
	} catch (error) {
		console.error("Error starting new game:", error.message);
		return;
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	}); 