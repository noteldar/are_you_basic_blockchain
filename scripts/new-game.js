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

	// Create a fixed question ID for simplicity
	const newQuestionId = "0x" + "1".repeat(64); // Simple fixed ID
	console.log("Using new question ID:", newQuestionId);

	// Start a new game
	console.log("Starting new game...");
	try {
		const tx = await game.startGame(newQuestionId);
		await tx.wait();
		console.log("New game started successfully!");

		// Update question-info.json
		try {
			let questionInfo = JSON.parse(fs.readFileSync("question-info.json", "utf8"));
			questionInfo.questionId = newQuestionId;
			fs.writeFileSync("question-info.json", JSON.stringify(questionInfo, null, 2));
			console.log("Updated question-info.json with new question ID");
		} catch (fileError) {
			console.error("Error updating question-info.json:", fileError);
		}
	} catch (error) {
		console.error("Error starting new game:", error.message);
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	}); 