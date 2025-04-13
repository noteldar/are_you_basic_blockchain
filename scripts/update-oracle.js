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

	// Read question info
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

	// Get question ID from the file
	const questionId = questionInfo.questionId;
	console.log("Question ID from file:", questionId);

	// Create a question hash (can be any bytes32 value for testing)
	const questionHash = "0x" + "2".repeat(64);

	// Update the oracle with the new question
	console.log("Updating oracle with new question...");
	try {
		const tx = await oracle.setQuestion(questionId, questionHash);
		await tx.wait();
		console.log("Oracle updated successfully!");
	} catch (error) {
		console.error("Error updating oracle:", error.message);
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	}); 