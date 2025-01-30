import { WIDTHBOARD, HEIGHTBOARD, player1, player2, ball } from "./init_game.js";

export function updateElements(){
	const gameBoard = document.getElementById('gameBoard');
	if (!gameBoard) {
		console.error('Canvas not found in updateElements');
		return;
	}
	const ctx = gameBoard.getContext('2d');

	// console.log('Canvas dimensions:', gameBoard.width, gameBoard.height);
	// console.log('Player 1 position:', player1.x, player1.y);
	// console.log('Drawing elements...');
	ctx.clearRect(0, 0, WIDTHBOARD, HEIGHTBOARD);

	drawElements(ctx, player1);
	drawElements(ctx, player2);
	drawElements(ctx, ball);
}

function drawElements(ctx, element) {
	// console.log('Drawing element:', {
	// 	 x: element.x,
	// 	 y: element.y,
	// 	 width: element.width,
	// 	 height: element.height,
	// 	 color: element.color
	// });
	ctx.fillStyle	= element.color;
	ctx.fillRect(element.x, element.y, element.width, element.height);
}
