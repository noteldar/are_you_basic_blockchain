const hre = require("hardhat");
const fs = require("fs");

async function main() {
	const [deployer] = await hre.ethers.getSigners();
	console.log("Running script with account:", deployer.address);

	// Read the contract addresses from the JSON file
	let contractAddresses;
	try {
		contractAddresses = JSON.parse(fs.readFileSync("contract-addresses.json", "utf8"));
	} catch (error) {
		console.error("Error reading contract addresses:", error);
		return;
	}

	// Get the contract instances
	const BasicGameContract = await hre.ethers.getContractFactory("BasicGameContract");
	const GameOracle = await hre.ethers.getContractFactory("GameOracle");

	const game = BasicGameContract.attach(contractAddresses.game);
	const oracle = GameOracle.attach(contractAddresses.oracle);

	// Get current question ID from the game contract
	const gameQuestionId = await game.currentQuestionId();
	console.log("Game Contract Question ID:", gameQuestionId);

	// Get current question ID from the oracle
	const [oracleQuestionId, questionHash] = await oracle.getCurrentQuestion();
	console.log("Oracle Question ID:", oracleQuestionId);

	// If they don't match, update the oracle's question ID
	if (gameQuestionId !== oracleQuestionId) {
		console.log("Question IDs don't match. Syncing Oracle to match Game Contract...");

		// Create a hash of the question ID to use as the question hash
		// In a real app, this would be a hash of the actual question text
		const questionHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("Synced Question Hash"));

		try {
			const tx = await oracle.setQuestion(gameQuestionId, questionHash);
			await tx.wait();
			console.log("Oracle question ID updated successfully!");

			// Verify the update
			const [updatedQuestionId, updatedHash] = await oracle.getCurrentQuestion();
			console.log("Updated Oracle Question ID:", updatedQuestionId);

			// Update the question-info.json file
			let questionInfo;
			try {
				questionInfo = JSON.parse(fs.readFileSync("question-info.json", "utf8"));
				questionInfo.questionId = gameQuestionId;
				fs.writeFileSync("question-info.json", JSON.stringify(questionInfo, null, 2));
				console.log("Updated question-info.json with synchronized question ID");
			} catch (fileError) {
				console.error("Error updating question-info.json:", fileError);
			}
		} catch (error) {
			console.error("Error updating oracle question ID:", error.message);
		}
	} else {
		console.log("Question IDs already match. No update needed.");
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	}); 