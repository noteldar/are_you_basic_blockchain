// scripts/submit-answer.js
const hre = require("hardhat");
const fs = require("fs");

async function main() {
	// Get signers (second is our player)
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

	// Get the question info
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

	// For this example, the player will submit the correct answer
	// In a real scenario, different players would submit different answers
	const playerAnswerText = questionInfo.answerText; // "Paris"

	// Hash the player's answer
	const playerAnswerHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(playerAnswerText));
	console.log(`Player submitting answer "${playerAnswerText}" with hash: ${playerAnswerHash}`);

	// Submit the answer
	await game.connect(player).submitAnswer(playerAnswerHash);
	console.log("Player submitted answer successfully");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	}); 