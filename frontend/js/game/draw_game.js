import { BOARD_WIDTH, BOARD_HEIGHT, player1, player2, ball } from "./init_game.js";

export function updateElements(){
	const gameBoard = document.getElementById('gameBoard');
	if (!gameBoard) {
		console.error('Canvas not found in updateElements');
		return;
	}
	const ctx = gameBoard.getContext('2d');

	ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

	drawElements(ctx, player1);
	drawElements(ctx, player2);
	drawElements(ctx, ball);
}

function drawElements(ctx, element) {
	ctx.fillStyle	= element.color;
	ctx.fillRect(element.x, element.y, element.width, element.height);
}
