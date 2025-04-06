
import { BOARD_HEIGHT, player1, player2, ball, setAnimationId, getAnimationId} from "./init_game.js";
import { updateElements } from "./draw_game.js";
import { keysPressed } from "./movement_game.js";
import { cleanupGame, resetGame } from "./game.js";

export let	socket;

export function startGame() {
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
	socket.send(messageJSON);
};

export function joinGame() {
	if (socket.readyState !== WebSocket.OPEN) {
		console.error('Error: WebSocket connection is not open');
		return;
	}
	const player_pk = localStorage.getItem('user_id');
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
	socket.send(message);
}

export function initSocket() {
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

export function resetSocket() {
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.close();
	}
	socket = null;
}

function parseMessage(data) {
	let message;

	try {
		message = JSON.parse(data);
	} catch (error) {
		console.error('Error parsing message:', error);
		return;
	}
	if (message.type === 'pong_game_update') {
		updateGame(message.game_state);
	}
	else if (message.type === 'game_over') {
		gameOver(message.game_state);
	}
	else if (message.type === 'lobby_update') {
		console.group('Lobby update');
		console.log('game_id:', message.game_id);
		console.log('players:', message.players);
		console.groupEnd();
		updateLobby(message.players);
	} else if (message.type === 'countdown' && getAnimationId() === null) {
		setAnimationId(requestAnimationFrame(onlineGameLoop));
	} else {
		if (message.message)
			console.log('Received message:', message.message);
		else
			console.log('Received message:', message);
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
	const	player1Container = document.getElementById('player1Name');
	const	player2Container = document.getElementById('player2Name');
	const	scoreContainer = document.getElementById('scoreGame');
	let		player1Score = 0;
	let		player2Score = 0;

	player1Score = score[player1Container.textContent];
	player2Score = score[player2Container.textContent];
	scoreContainer.textContent = `${player1Score} - ${player2Score}`;
}

function gameOver(game_state) {
	console.log('Game over:', game_state);
	resetSocket();
	resetGame();
	updateScore(game_state.score);
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
}
