import { aiLoop, cleanAi, isAi} from "./ai.js";
import { ensureInit, setGameBoardSize, gameModeSelector, HEIGHTBOARD, WIDTHBOARD, HEIGHTOBJECTS, WIDTHOBJECTS, player1, player2, ball} from "./init_game.js";
import { updateElements } from "./draw_game.js";
import { handleMovement } from "./movement_game.js";
import { errorHandler, listenerResize } from "./listeners_game.js";

console.log('=== Game Script Starting ===');

let animationId, gameButton;
let isAnimating = false;
let eventListeners = [];
export const keysPressed = {};

console.log('game.js started');

window.addEventListener('error', errorHandler);
eventListeners.push({element: window, type: 'error', listener: errorHandler});

window.addEventListener('resize', listenerResize);
eventListeners.push({element: window, type: 'resize', listener: listenerResize});

ensureInit();
window.ensureInit = ensureInit;

//Main Loop
function gameLoop() {
	gameMode = gameModeSelector.value;
	gameButton = document.getElementsByClassName('gameButton')[0]
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
		if (ball.speed < WIDTHBOARD / 30)
			ball.speed = WIDTHBOARD / 30;
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

function resetGame(){
	console.log('Game was reset');
	isAnimating = false;
	gameButton = document.getElementsByClassName('gameButton')[0]
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
function cleanupGame(){
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
