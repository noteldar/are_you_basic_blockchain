// scripts/set_question.js
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

	// Get the oracle contract instance
	const GameOracle = await hre.ethers.getContractFactory("GameOracle");
	const oracle = GameOracle.attach(contractAddresses.oracle);

	// Create a question ID and hash (in a real application, this would come from your backend)
	const questionText = "What is the capital of France?";
	const questionId = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(questionText));
	const answerText = "Paris";
	const correctAnswerHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(answerText));

	console.log("Setting question ID:", questionId);
	console.log("Correct answer hash:", correctAnswerHash);

	// Set the question in the oracle
	await oracle.setQuestion(questionId, hre.ethers.keccak256(hre.ethers.toUtf8Bytes(questionText)));
	console.log("Question set in oracle");

	// Save this information for later use in the resolve script
	const questionInfo = {
		questionText,
		questionId,
		answerText,
		correctAnswerHash
	};

	fs.writeFileSync(
		"question-info.json",
		JSON.stringify(questionInfo, null, 2)
	);
	console.log("Question information saved to question-info.json");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});