import { aiLoop, cleanAi} from "./ai.js";
import { gameModeSelector, BOARD_WIDTH, player1, player2, ball} from "./init_game.js";
import { updateElements } from "./draw_game.js";
import { handleMovement , addMovement, stopMovement, resetScore } from "./movement_game.js";
import { errorHandler, listenerResize} from "./listeners_game.js";
console.log('=== Game Script Starting ===');

let animationId, gameButton;
let isAnimating = false;
let eventListeners = [];

console.log('game.js started');

window.addEventListener('error', errorHandler);
eventListeners.push({element: window, type: 'error', listener: errorHandler});

window.addEventListener('resize', listenerResize);
eventListeners.push({element: window, type: 'resize', listener: listenerResize});

document.addEventListener('keydown', addMovement);
eventListeners.push({element: document, type: 'keydown', listener: addMovement});

document.addEventListener('keyup', stopMovement);
eventListeners.push({element: document, type: 'keyup', listener: stopMovement});

const player_name = localStorage.getItem('username') || 'Player 1';
document.getElementById('player1Name').textContent = player_name;

const opponent_name = document.getElementById('player2Name');

//Main Loop
export function gameLoop() {
	gameMode = gameModeSelector.value;
	gameButton = document.getElementById('startGame');
	if (gameButton.textContent === 'Start')
	{
		gameButton.addEventListener('click', resetGame, { once: true });
		gameButton.textContent = 'Reset';
	}
	const gameBoard = document.getElementById('gameBoard');
	if (!gameBoard) {
		console.log('Game board not found, stopping game loop');
		cleanupGame();
	}
	if (gameMode == 'ai')
		aiLoop(ball, player2, "ArrowUp", "ArrowDown");
	else if (gameMode == 'ai2')
	{
		if (ball.speed < BOARD_WIDTH / 30)
			ball.speed = BOARD_WIDTH / 30;
		aiLoop(ball, player2, "ArrowUp", "ArrowDown");
		aiLoop(ball, player1, 'w', 's');
	}
	handleMovement();
	if (gameMode == 'ai' || gameMode == 'ai2')
		cleanAi();
	updateElements();
	animationId = requestAnimationFrame(gameLoop);
	isAnimating = true;
}

export function resetGame(){
	console.log('Game was reset');
	isAnimating = false;
	gameButton = document.getElementById('startGame');
	ball.reset();
	player1.reset();
	player2.reset();
	resetScore();
	updateElements();
	cancelAnimationFrame(animationId);
	gameButton.textContent = 'Start';
	gameButton.addEventListener('click', gameLoop, { once: true });
}

//Clean Up
export function cleanupGame(){
	console.log('cleanup GAME called');
	if (isAnimating)
	{
		isAnimating = false;
		cancelAnimationFrame(animationId);
	}
	eventListeners.forEach(({element, type, listener}) => {
		console.log(`Removing ${type} listener from`, element);
		element.removeEventListener(type, listener);
	});
	window.gameState.initialized = false;
	window.gameState.cleanup = null;
	eventListeners = [];
}

export const socket = new WebSocket('wss://localhost/ws/pong/');

const joinGameContainer = document.getElementById('lobbyInput');

if (localStorage.getItem('username') !== null)
{
	// Open WebSocket connection
	socket.onopen = () => {
		console.log('WebSocket connection established');
	};
	
	// Handle incoming messages
	socket.onmessage = (event) => {
		try {
			const message = JSON.parse(event.data);
			console.log('Received message:', message);
		} catch (e) {
			console.error('Error parsing received JSON:', e);
		}
	};
	// Handle WebSocket errors
	socket.onerror = (error) => {
		console.error('WebSocket Error:', error);
	};

	// Handle WebSocket close
	socket.onclose = () => {
		console.log('WebSocket connection closed');
	};
	document.getElementById("startGame").addEventListener('click', startGameListener);
	document.getElementById("joinGame").addEventListener('click', joinGame);
	joinGameContainer.style.display = 'flex';
	// opponent_name.textContent = 'Waiting for opponent...';
}

function sendToSocket(message) {
	console.log("Sending message:", message);
	socket.send(message);
}

function startGameListener() {
	const message = {
		action: 'start_game',
	};
	const messageJSON = JSON.stringify(message);
	sendToSocket(messageJSON);
}

function joinGame() {
	const player_pk = localStorage.getItem('user_id');
	const lobby = document.getElementById('lobbyId').value;

	const message = {
		action: 'join_lobby',
		player_pk: player_pk,
		game_id: lobby,
	};
	const messageJSON = JSON.stringify(message);
	sendToSocket(messageJSON);

document.getElementById("startGame").addEventListener('click', startGameListener);
document.getElementById("joinGame").addEventListener('click', joinGame);
}
