// server.js
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Contract ABIs and addresses
const oracleABI = require('./abis/GameOracle.json').abi;
const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS;

// Connect to Ethereum network
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
const privateKey = process.env.PRIVATE_KEY; // Oracle owner's private key
const wallet = new ethers.Wallet(privateKey, provider);
const oracle = new ethers.Contract(ORACLE_ADDRESS, oracleABI, wallet);

// Store current answers and their evaluation
const pendingAnswers = {};

// Endpoint to store answers and evaluate them
app.post('/api/submit-answer', async (req, res) => {
	try {
		const { address, answer, questionId } = req.body;

		// Call your evaluation API
		const apiResponse = await axios.post('http://localhost:8000/evaluate', {
			conversation: [
				{
					role: "system",
					content: "You are a helpful assistant."
				},
				{
					role: "user",
					content: req.body.question
				},
				{
					role: "assistant",
					content: answer
				}
			]
		});

		const result = apiResponse.data;
		const finalScore = result.final_score || 0;
		const isWinner = finalScore >= 0.5;

		// Store the result for this answer
		pendingAnswers[address] = {
			address,
			questionId,
			answer,
			isWinner,
			score: finalScore,
			timestamp: Date.now()
		};

		// If this is a winner, resolve the game
		if (isWinner) {
			try {
				// Only the oracle owner can call resolveWithWinner
				const tx = await oracle.resolveWithWinner(questionId, address);
				await tx.wait();
				console.log(`Game resolved with winner: ${address}`);
			} catch (error) {
				console.error("Error resolving game:", error);
			}
		}

		res.json({
			success: true,
			result,
			isWinner
		});
	} catch (error) {
		console.error("Error processing answer:", error);
		res.status(500).json({ success: false, error: error.message });
	}
});

// Endpoint to get questions
app.get('/api/questions/:questionId', (req, res) => {
	const { questionId } = req.params;

	// In a real app, you'd fetch from a database
	// For demo, return fixed questions
	const questions = {
		[ethers.utils.id("question0")]: "What's your favorite book?",
		[ethers.utils.id("question1")]: "What's your favorite movie?",
		// Add more questions here...
	};

	res.json({
		questionId,
		questionText: questions[questionId] || "Unknown question"
	});
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});