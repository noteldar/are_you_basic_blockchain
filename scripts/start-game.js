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

	console.log("Starting game with question ID:", questionInfo.questionId);

	// Start the game with the question ID
	await game.startGame(questionInfo.questionId);
	console.log("Game started successfully");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	}); 