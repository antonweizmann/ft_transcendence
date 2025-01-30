
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
}

export function errorHandler(e) {
	console.error('Global error:', e.message);
}
