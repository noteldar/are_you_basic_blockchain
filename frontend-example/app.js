// Import ethers from the CDN
import { ethers } from "https://cdn.ethers.org/lib/ethers-5.7.esm.min.js";

// Contract ABIs and addresses will be loaded dynamically
let contractAddresses = null;
let testUSDTContract = null;
let gameContract = null;
let provider = null;
let signer = null;

// Elements
const connectWalletBtn = document.getElementById('connect-wallet');
const accountAddressEl = document.getElementById('account-address');
const connectionStatusEl = document.getElementById('connection-status');
const gameInfoSection = document.getElementById('game-info');
const gameStatusEl = document.getElementById('game-status');
const questionDisplayEl = document.getElementById('question-display');
const placeBetSection = document.getElementById('place-bet-section');
const submitAnswerSection = document.getElementById('submit-answer-section');
const betAmountInput = document.getElementById('bet-amount');
const approveBtn = document.getElementById('approve-btn');
const placeBetBtn = document.getElementById('place-bet-btn');
const answerInput = document.getElementById('answer-input');
const submitAnswerBtn = document.getElementById('submit-answer-btn');
const txStatusEl = document.getElementById('tx-status');

// Initialize the application
async function init() {
	try {
		// Load contract addresses
		const response = await fetch('../contract-addresses.json');
		contractAddresses = await response.json();
		console.log('Contract addresses loaded:', contractAddresses);

		// Set up event listeners
		connectWalletBtn.addEventListener('click', connectWallet);
		approveBtn.addEventListener('click', approveUSDT);
		placeBetBtn.addEventListener('click', placeBet);
		submitAnswerBtn.addEventListener('click', submitAnswer);

		// If MetaMask is already connected, initialize
		if (window.ethereum && window.ethereum.selectedAddress) {
			await connectWallet();
		}
	} catch (error) {
		console.error('Initialization error:', error);
		updateStatus('Error initializing app. Make sure you have deployed contracts locally.', true);
	}
}

// Connect wallet function
async function connectWallet() {
	try {
		// Check if MetaMask is installed
		if (!window.ethereum) {
			throw new Error('MetaMask not detected. Please install MetaMask.');
		}

		// Connect to provider
		provider = new ethers.providers.Web3Provider(window.ethereum);

		// Request accounts access
		const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
		const account = accounts[0];

		// Get signer
		signer = provider.getSigner();

		// Update UI
		accountAddressEl.textContent = `Connected: ${account}`;
		connectionStatusEl.textContent = 'Connected to blockchain';
		connectWalletBtn.textContent = 'Connected';
		connectWalletBtn.disabled = true;

		// Show game info section
		gameInfoSection.classList.remove('hidden');
		placeBetSection.classList.remove('hidden');

		// Load contracts
		await loadContracts();

		// Check game state
		await checkGameState();

	} catch (error) {
		console.error('Connection error:', error);
		updateStatus(`Connection error: ${error.message}`, true);
	}
}

// Load contract ABIs and create contract instances
async function loadContracts() {
	try {
		// Typically you would load these from artifact files
		// For this example, we'll use simplified ABIs

		// TestUSDT ABI (simplified for the example)
		const usdtAbi = [
			"function balanceOf(address owner) view returns (uint256)",
			"function decimals() view returns (uint8)",
			"function approve(address spender, uint256 amount) returns (bool)",
			"function allowance(address owner, address spender) view returns (uint256)",
			"function transfer(address to, uint256 amount) returns (bool)"
		];

		// Game contract ABI (simplified for the example)
		const gameAbi = [
			"function getGameState() view returns (uint8)",
			"function currentQuestionId() view returns (bytes32)",
			"function placeBet(uint256 betAmount) external",
			"function submitAnswer(bytes32 answerHash) external",
			"function hasPlayerSubmittedAnswer(address player) view returns (bool)"
		];

		// Create contract instances
		testUSDTContract = new ethers.Contract(contractAddresses.usdt, usdtAbi, provider);
		gameContract = new ethers.Contract(contractAddresses.game, gameAbi, provider);

		// Connect with signer
		testUSDTContract = testUSDTContract.connect(signer);
		gameContract = gameContract.connect(signer);

		updateStatus('Contracts loaded successfully');
	} catch (error) {
		console.error('Error loading contracts:', error);
		updateStatus(`Error loading contracts: ${error.message}`, true);
	}
}

// Check the current game state
async function checkGameState() {
	try {
		const gameState = await gameContract.getGameState();

		// GameState: INACTIVE = 0, ACTIVE = 1, COMPLETED = 2
		if (gameState === 1) { // ACTIVE
			gameStatusEl.textContent = 'Game is ACTIVE';

			// Get question ID
			const questionId = await gameContract.currentQuestionId();
			questionDisplayEl.textContent = `Question ID: ${questionId}`;

			// Check if the current player has already submitted an answer
			const playerAddress = await signer.getAddress();
			const hasSubmittedAnswer = await gameContract.hasPlayerSubmittedAnswer(playerAddress);

			if (hasSubmittedAnswer) {
				submitAnswerSection.classList.add('hidden');
				updateStatus('You have already submitted an answer');
			} else {
				submitAnswerSection.classList.remove('hidden');
			}
		} else if (gameState === 0) { // INACTIVE
			gameStatusEl.textContent = 'No active game';
			placeBetSection.classList.add('hidden');
			submitAnswerSection.classList.add('hidden');
		} else { // COMPLETED
			gameStatusEl.textContent = 'Game is COMPLETED';
			placeBetSection.classList.add('hidden');
			submitAnswerSection.classList.add('hidden');
		}
	} catch (error) {
		console.error('Error checking game state:', error);
		updateStatus(`Error checking game state: ${error.message}`, true);
	}
}

// Approve USDT spending
async function approveUSDT() {
	try {
		updateStatus('Approving USDT...');

		// Get bet amount from input
		const betAmount = ethers.utils.parseUnits(betAmountInput.value, 6); // USDT has 6 decimals

		// Approve the game contract to spend USDT
		const tx = await testUSDTContract.approve(contractAddresses.game, betAmount);
		updateStatus(`Approval transaction sent: ${tx.hash}`);

		// Wait for transaction to be mined
		await tx.wait();
		updateStatus('USDT approved successfully!');
	} catch (error) {
		console.error('Approval error:', error);
		updateStatus(`Approval error: ${error.message}`, true);
	}
}

// Place a bet
async function placeBet() {
	try {
		updateStatus('Placing bet...');

		// Get bet amount from input
		const betAmount = ethers.utils.parseUnits(betAmountInput.value, 6); // USDT has 6 decimals

		// Place the bet
		const tx = await gameContract.placeBet(betAmount);
		updateStatus(`Bet transaction sent: ${tx.hash}`);

		// Wait for transaction to be mined
		await tx.wait();
		updateStatus('Bet placed successfully!');

		// Update UI
		submitAnswerSection.classList.remove('hidden');
	} catch (error) {
		console.error('Betting error:', error);
		updateStatus(`Betting error: ${error.message}`, true);
	}
}

// Submit an answer
async function submitAnswer() {
	try {
		updateStatus('Submitting answer...');

		// Get the answer from input
		const answer = answerInput.value.trim();
		if (!answer) {
			throw new Error('Please enter an answer');
		}

		// Hash the answer
		const answerHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(answer));

		// Submit the answer
		const tx = await gameContract.submitAnswer(answerHash);
		updateStatus(`Answer submission transaction sent: ${tx.hash}`);

		// Wait for transaction to be mined
		await tx.wait();
		updateStatus('Answer submitted successfully!');

		// Update UI
		submitAnswerSection.classList.add('hidden');
	} catch (error) {
		console.error('Answer submission error:', error);
		updateStatus(`Answer submission error: ${error.message}`, true);
	}
}

// Update status message
function updateStatus(message, isError = false) {
	txStatusEl.textContent = message;
	txStatusEl.style.color = isError ? 'red' : 'black';
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', init); 