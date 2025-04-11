import { resizeElement } from "./element.js";
import { updateElements } from "./draw_game.js";
import { addMovement, stopMovement } from "./movement_game.js";
import { eventListeners } from "./game.js";
import {
	player1,
	player2,
	ball,
	setGameBoardSize,
	startGameTimer,
	changeGameMode
} from "./init_game.js";

export {
	addGameListeners,
}

function addGameListeners() {
	const gameModeSelector = document.getElementById('gameMode');
	const startButton = document.getElementById('startGame');

	gameModeSelector.addEventListener('change', changeGameMode);
	startButton.addEventListener('click', startGameTimer);
	window.addEventListener('error', errorHandler);
	window.addEventListener('resize', listenerResize);
	eventListeners.push({element: window, type: 'error', listener: errorHandler});
	eventListeners.push({element: window, type: 'resize', listener: listenerResize});
	document.addEventListener('keydown', addMovement);
	document.addEventListener('keyup', stopMovement);
	eventListeners.push({element: document, type: 'keydown', listener: addMovement});
	eventListeners.push({element: document, type: 'keyup', listener: stopMovement});
}

function debounce(func, wait) {
	let timeout;
	return function (...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

function listenerResize()
{
	const debouncedResize = debounce(setGameBoardSize, 100);
	debouncedResize();
	resizeElement(player1);
	resizeElement(player2);
	resizeElement(ball);
	updateElements();
}

function errorHandler(e) {
	console.error('Global error:', e.message);
}
