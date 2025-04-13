// scripts/resolve-game.js
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

	// Get the oracle contract instance
	const GameOracle = await hre.ethers.getContractFactory("GameOracle");
	const oracle = GameOracle.attach(contractAddresses.oracle);

	console.log("Resolving game with:");
	console.log("- Question ID:", questionInfo.questionId);
	console.log("- Correct answer hash:", questionInfo.correctAnswerHash);

	// Resolve the game with the correct answer
	await oracle.resolveWithAnswer(questionInfo.questionId, questionInfo.correctAnswerHash);
	console.log("Game resolved successfully");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});