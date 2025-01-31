import { resizeElement } from "./element.js";
import { updateElements } from "./draw_game.js";
import { player1, player2, ball, setGameBoardSize	 } from "./init_game.js";

function debounce(func, wait) {
	let timeout;
	return function (...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

export function listenerResize()
{
	const debouncedResize = debounce(setGameBoardSize, 100);
	debouncedResize();
	resizeElement(player1);
	resizeElement(player2);
	resizeElement(ball);
	updateElements();
}

export function errorHandler(e) {
	console.error('Global error:', e.message);
}
