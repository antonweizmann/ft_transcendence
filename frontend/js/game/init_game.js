import { Element } from "./element.js";
import { updateElements } from "./draw_game.js";
import {setAiReaction} from "./ai.js"
import {gameLoop, cleanupGame, resetGame} from "./game.js"
const PINK = '#8A4FFF';
const PURPLE = '#9932CC';
const BLUE = '#5D3FD3';
export let gameModeSelector, gameMode;
export let HEIGHTBOARD = 500;
export let WIDTHBOARD = 800;
export let WIDTHOBJECTS = WIDTHBOARD / 40;
export let HEIGHTOBJECTS = HEIGHTBOARD / 5;
export let player1, player2, ball;

export function ensureInit() {
	if (window.gameState.initialized === true) return;

	console.log('Ensuring initialization...');
	if (document.readyState === 'complete') {
		console.log('Document already complete, initializing now');
		initGame();
		window.gameState.initialized = true;
		window.gameState.cleanup = cleanupGame;
	} else {
		console.log('Document not ready, adding listener');
		document.addEventListener('DOMContentLoaded', listenerGame);
	}
}

function listenerGame() {
	initGame();
	window.gameState.initialized = true;
	window.gameState.cleanup = cleanupGame;
}

function initGame() {
	console.log('=== Initializing Game ===');
	const gameBoard = document.getElementById('gameBoard');
	console.log('Canvas element found:', !!gameBoard);

	if (!gameBoard) {
		console.error('Canvas element not found');
		return;
	}

	setGameBoardSize(true);
	const ctx = gameBoard.getContext('2d');

	let startPlayer1 = {
		x: () => WIDTHBOARD / 80,
		y: () => HEIGHTBOARD / 2 - HEIGHTOBJECTS / 2,
		height: () => HEIGHTOBJECTS,
		width: () => WIDTHOBJECTS,
		maxY: () => HEIGHTBOARD - HEIGHTOBJECTS,
		maxX: () => WIDTHBOARD - WIDTHOBJECTS,
		speed: () => HEIGHTBOARD / 50,
		color: PINK,
	};

	let startPlayer2 = {
		x: () => WIDTHBOARD -  WIDTHBOARD / 80 - WIDTHOBJECTS,
		y: () => HEIGHTBOARD / 2 - HEIGHTOBJECTS / 2,
		height: () => HEIGHTOBJECTS,
		width: () => WIDTHOBJECTS,
		maxY: () => HEIGHTBOARD - HEIGHTOBJECTS,
		maxX: () => WIDTHBOARD - WIDTHOBJECTS,
		speed: () => HEIGHTBOARD / 50,
		color: PINK,
	};
	let startBallValues = {
		x: () => WIDTHBOARD / 2 - WIDTHOBJECTS / 2,
		y: () => HEIGHTBOARD / 2 - HEIGHTOBJECTS / 10,
		height: () => HEIGHTOBJECTS / 5,
		width: () => WIDTHOBJECTS,
		maxY: () => HEIGHTBOARD - HEIGHTOBJECTS / 5,
		maxX: () => WIDTHBOARD - WIDTHOBJECTS,
		speed: () => WIDTHBOARD / 120,
		dirX: Math.round(Math.random()) ? -1 : 1,
		dirY: Math.round(Math.random()) ? -1 : 1,
		color: PURPLE,
	};

	player1 = new Element(startPlayer1);
	player1.original = startPlayer1;
	player2 = new Element(startPlayer2);
	player2.original = startPlayer2;
	ball = new Element(startBallValues);
	ball.original = startBallValues;



	ball.reset = function () {
		ball.x = startBallValues.x();
		ball.y = startBallValues.y();
		ball.speed = startBallValues.speed();
		// -1 is to the left and 1 to the right
		ball.dirX = Math.round(Math.random()) ? -1 : 1,
		ball.dirY = Math.round(Math.random()) ? -1 : 1,
		console.log('Ball was reset');
	}
	player1.reset = function() {
		player1.x = startPlayer1.x();
		player1.y = startPlayer1.y();
	}
	player2.reset = function() {
		player2.x = startPlayer2.x();
		player2.y = startPlayer2.y();
	}
	console.log('Starting game loop with dimensions:', WIDTHBOARD, HEIGHTBOARD);
	setGameBoardSize();
	document.getElementsByClassName('gameButton')[0].addEventListener('click', gameLoop, { once: true });
	gameModeSelector = document.getElementById('gameMode');

	gameModeSelector.addEventListener('change', listenerMode);
}

function listenerMode() {
	// Get the selected value
	gameMode = gameModeSelector.value;
	const difficulty = document.getElementById("difficulty");
	// Take action based on the selected value
	console.log('Selected game mode:', gameMode);
	resetGame();
	if (gameMode === 'human') {
		document.getElementById("player1Name").innerText = "Player 1";
		document.getElementById("player2Name").innerText = "Player 2";
		console.log('Action for Human vs Human');
		gameModeSelector.style.width = '100%';
		difficulty.style.display = "none";
	} else if (gameMode === 'ai') {
		document.getElementById("player2Name").innerText = "AI";
		console.log('Action for Human vs AI');
		if (window.innerWidth > 768)
			gameModeSelector.style.width = '50%';
		difficulty.style.display = "block";
		difficulty.addEventListener('change', setAiReaction);
	} else if (gameMode === 'ai2') {
		document.getElementById("player1Name").innerText = "AI";
		document.getElementById("player2Name").innerText = "AI";
		console.log('Action for AI vs AI');
		gameModeSelector.style.width = '100%';
		difficulty.style.display = "none";
		difficulty.addEventListener('change', setAiReaction);
	}
}

export function setGameBoardSize(isInitialSetup = false) {
	const  smallerDimension = Math.min(window.innerWidth, window.innerHeight);
	WIDTHBOARD = Math.floor(smallerDimension * 1);
	HEIGHTBOARD = Math.floor(WIDTHBOARD * (5/9)); // Maintain a 9 / 5 Ratio

	// Recalculate other dependent variables
	WIDTHOBJECTS = WIDTHBOARD / 45;
	HEIGHTOBJECTS = HEIGHTBOARD / 5;
	const gameBoard = document.getElementById('gameBoard');
	if (gameBoard) {
		gameBoard.width = WIDTHBOARD;
		gameBoard.height = HEIGHTBOARD;
		// updateElements(); // Redraw after resize
		console.log('Canvas resized to:', WIDTHBOARD, HEIGHTBOARD);
		if (!isInitialSetup)
			updateElements();
	}
}
