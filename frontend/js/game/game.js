import { aiLoop, cleanAi } from "./ai.js";
import { gameModeSelector, BOARD_WIDTH, player1, player2, ball, getAnimationId, setAnimationId } from "./init_game.js";
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
	setAnimationId(requestAnimationFrame(gameLoop));
}

export function resetGame(){
	console.log('Game was reset');
	setAnimationId(null);
	gameButton = document.getElementById('startGame');
	ball.reset();
	player1.reset();
	player2.reset();
	resetScore();
	updateElements();
	cancelAnimationFrame(getAnimationId());
	gameButton.textContent = 'Start';
	gameButton.addEventListener('click', gameLoop, { once: true });
}

//Clean Up
export function cleanupGame(){
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

