
import { updateElements } from "./draw_game.js";
import { keysPressed } from "./movement_game.js";
import { cleanupGame, resetGame } from "./game.js";
import { getCookie } from "../cookies.js";
import { loadPage } from "../main.js";
import { showToast } from "../tournament/tournament_lobby.js";
import {
	BOARD_HEIGHT,
	player1,
	player2,
	ball,
	setAnimationId,
	getAnimationId,
	startGameTimer
} from "./init_game.js";

export {
	socket,
	startGame,
	joinGame,
	initSocket,
	resetSocket,
}

let	socket;

function startGame() {
	console.log('Starting game');
	const message = {
		action: 'start_game',
	};
	const messageJSON = JSON.stringify(message);
	sendToSocket(messageJSON);
	onlineGameLoop();
}

//Main Loop
function onlineGameLoop() {
	const gameBoard = document.getElementById('gameBoard');
	if (!gameBoard) {
		console.log('Game board not found, stopping game loop');
		cleanupGame();
	}
	handleMovement();
	updateElements();
	setAnimationId(requestAnimationFrame(onlineGameLoop));
}

function handleMovement() {
	let direction;

	if (keysPressed['w'] || keysPressed['ArrowUp'])
		direction = 'up';
	if (keysPressed['s'] || keysPressed['ArrowDown'])
		direction = 'down';
	if (!direction)
		return ;
	const message = {
		action: 'move',
		move: direction,
	};
	const messageJSON = JSON.stringify(message);
	if (socket && socket.readyState === WebSocket.OPEN)
		socket.send(messageJSON);
};

function joinGame() {
	if (!socket || socket.readyState !== WebSocket.OPEN) {
		console.error('Error: WebSocket connection is not open');
		return;
	}
	const player_pk = getCookie('user_id');
	const lobby = document.getElementById('lobbyId').value;
	const lobbyContainer = document.getElementById('lobbyInput');

	const message = {
		action: 'join_lobby',
		player_pk: player_pk,
		game_id: lobby,
	};
	const messageJSON = JSON.stringify(message);
	sendToSocket(messageJSON);

	lobbyContainer.style.display = 'none';
}

function sendToSocket(message) {
	console.log("Sending message:", message);
	if (!socket) {
		console.warn('Warning: WebSocket connection is not established');
		return;
	}
	socket.send(message);
}

function initSocket() {
	if (socket) {
		console.error('Socket already exists');
		return;
	}
	socket = new WebSocket('wss://localhost/ws/pong/');
	socket.onopen = () => {
		console.log('WebSocket connection established');
	};
	socket.onmessage = (event) => {
			parseMessage(event.data);
	};
	socket.onerror = (error) => {
		console.error('WebSocket Error:', error);
	};
	socket.onclose = () => {
		console.log('WebSocket connection closed');
	};
}

function resetSocket() {
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.close();
	}
	socket = null;
}

function parseMessage(data) {
	let message;
	const gameTimer = document.getElementById('scoreGame');

	try {
		message = JSON.parse(data);
	} catch (error) {
		console.error('Error parsing message:', error);
		return;
	}
	if (message.type === 'pong_game_update') {
		updateGame(message.game_state);
		deactivateStartButton();
	} else if (message.type === 'game_over') {
		gameOver(message.game_state);
	} else if (message.type === 'lobby_update') {
		updateLobby(message.players);
	} else if (message.type === 'countdown' && message.message) {
		if (getAnimationId() === null) 
			setAnimationId(requestAnimationFrame(onlineGameLoop));
		deactivateStartButton();
		gameTimer.textContent = message.message[17] + ' : ' + message.message[17];
		console.log('Received message:', message.message);
	} else if (message.type === 'error') {
		console.log('Error:', message.details);
		showToast('Error', message.details);
	} else if (message.message)
		console.log('Received message:', message.message);
	else
		console.log('Received message:', message);
}

function deactivateStartButton() {
	const startButton = document.getElementById('startGame');

	if (startButton) {
		startButton.removeEventListener('click', startGameTimer);
		startButton.classList.add('button-pressed');
		startButton.disabled = true;
		startButton.classList.remove('button-hover');
	}
}

function updateGame(game_state) {
	const X = 0;
	const Y = 1;
	const scale = BOARD_HEIGHT / 500;

	if (getAnimationId() === null)
		setAnimationId(requestAnimationFrame(onlineGameLoop));
	player1.y = game_state.paddle_1_position * scale;
	player2.y = game_state.paddle_2_position * scale;
	ball.x = game_state.ball_position[X] * scale;
	ball.y = game_state.ball_position[Y] * scale;
	updateScore(game_state.score);
}

function updateScore(score) {
	const scoreContainer = document.getElementById('scoreGame');
	const player1Container = document.getElementById('player1Name');
	const player2Container = document.getElementById('player2Name');

	// Extract player names from the score object
	const players = Object.keys(score);
	const player1Name = players[0];
	const player2Name = players[1];

	// Extract scores
	const player1Score = score[player1Name];
	const player2Score = score[player2Name];

	// Update the frontend
	player1Container.textContent = player1Name;
	player2Container.textContent = player2Name;
	scoreContainer.textContent = `${player1Score} : ${player2Score}`;
}

function gameOver(game_state) {
	console.log('Game over:', game_state);
	resetSocket();
	resetGame();
	updateScore(game_state.score);
	showWinningScreen(game_state);
}

function updateLobby(players) {
	const player1Container = document.getElementById('player1Name');
	const player2Container = document.getElementById('player2Name');

	if (getAnimationId() !== null)
		return;
	player1Container.textContent = '';
	player2Container.textContent = '';
	for (const player of players) {
		if (player.index === 0) {
			player1Container.textContent = player.username;
		} else if (player.index === 1) {
			player2Container.textContent = player.username;
		}
	}
	if (player2Container.textContent === '') {
		player2Container.textContent = 'Waiting for player 2...';
	}
	if (player1Container.textContent === '') {
		player1Container.textContent = 'Waiting for player 1...';
	}
}

function showWinningScreen(game_state) {
	const player1Container = document.getElementById('player1Name');
	const player2Container = document.getElementById('player2Name');
	const winnerMessage = document.getElementById('winnerMessage');
	const winningScreen = document.getElementById('winningScreen');

	const player1Score = game_state.score[player1Container.textContent];
	const player2Score = game_state.score[player2Container.textContent];

	let winnerText = 'Draw!';
	if (player1Score > player2Score) {
		winnerText = `${player1Container.textContent} wins!`;
	} else if (player2Score > player1Score) {
		winnerText = `${player2Container.textContent} wins!`;
	}

	winnerMessage.textContent = winnerText;
	winningScreen.style.display = 'flex';

	setTimeout(() => {
		loadPage('play');
	}, 5000);
}
