import { aiLoop, cleanAi } from "./ai.js";
import { gameModeSelector, startGameTimer, BOARD_WIDTH, player1, player2, ball, getAnimationId, setAnimationId } from "./init_game.js";
import { updateElements } from "./draw_game.js";
import { handleMovement , addMovement, stopMovement, resetScore } from "./movement_game.js";
import { errorHandler, listenerResize } from "./listeners_game.js";
import { resetSocket } from "./online_game.js";

let	gameButton;
let	eventListeners = [];

window.addEventListener('error', errorHandler);
eventListeners.push({element: window, type: 'error', listener: errorHandler});

window.addEventListener('resize', listenerResize);
eventListeners.push({element: window, type: 'resize', listener: listenerResize});

document.addEventListener('keydown', addMovement);
eventListeners.push({element: document, type: 'keydown', listener: addMovement});

document.addEventListener('keyup', stopMovement);
eventListeners.push({element: document, type: 'keyup', listener: stopMovement});

//Main Loop
export function gameLoop() {
	const gameMode = gameModeSelector.value;
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
	setAnimationId(requestAnimationFrame(gameLoop));
}

export function resetGame() {
	console.log('Game was reset');
	gameButton = document.getElementById('startGame');
	ball.reset();
	player1.reset();
	player2.reset();
	resetScore();
	updateElements();
	cancelAnimationFrame(getAnimationId());
	setAnimationId(null);
	gameButton.textContent = 'Start';
	gameButton.addEventListener('click', startGameTimer);
}

//Clean Up
export function cleanupGame() {
	console.log('cleanup GAME called');
	const animationID = getAnimationId();
	if (animationID)
	{
		cancelAnimationFrame(animationID);
		setAnimationId(null);
	}
	eventListeners.forEach(({element, type, listener}) => {
		console.log(`Removing ${type} listener from`, element);
		element.removeEventListener(type, listener);
	});
	window.gameState.initialized = false;
	window.gameState.cleanup = null;
	eventListeners = [];
	resetSocket();
}

window.resetGameAndLobby = function () {
	const winningScreen = document.getElementById('winningScreen');
	winningScreen.style.display = 'none';
	// You can also redirect or reset here
	const lobbyInput = document.getElementById('lobbyInput');
	if (lobbyInput)
		lobbyInput.style.display = 'block';
}
