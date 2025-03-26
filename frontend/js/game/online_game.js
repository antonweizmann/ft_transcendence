
import { gameModeSelector, BOARD_WIDTH, player1, player2, ball, setAnimationId} from "./init_game.js";
import { updateElements } from "./draw_game.js";
import { keysPressed } from "./movement_game.js";

export	let socket;

export function startGame() {
	console.log('Starting game');
	if (!socket) {
		console.error('You must join a game before starting it');
		return;
	}
	const message = {
		action: 'start_game',
	};
	const messageJSON = JSON.stringify(message);
	sendToSocket(messageJSON);
	onlineGameLoop();
}

//Main Loop
function onlineGameLoop() {
	gameMode = gameModeSelector.value;

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
	sendToSocket(messageJSON);
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
	else if (message.type === 'pong_game_over') {
		gameOver(message.game_state);
	}
	else if (message.type === 'lobby_update') {
		updateLobby(message.players);
	} else {
		console.log('Received message:', message.message);
	}
}

// "game_state": {
// 	"score": {"1_jfikents": 2, "2_1@1.com": 2},
// 	"ball_position": [56.218825122723885, 113.4293962816304],
// 	"ball_direction": [-1, 1],
// 	"paddle_1_position": 250,
// 	"paddle_2_position": 250
// }
function updateGame(game_state) {
	const X = 0;
	const Y = 1;

	player1.y = game_state.paddle_1_position;
	player2.y = game_state.paddle_2_position;
	ball.x = game_state.ball_position[X];
	ball.y = game_state.ball_position[Y];
	console.log('Updating game state:', game_state);
}

function gameOver(game_state) {
	console.log('Game over:', game_state);
}

function updateLobby(players) {

}
