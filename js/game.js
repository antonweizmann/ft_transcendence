console.log('game.js is executing');

const PINK = '#8A4FFF';
const PURPLE = '#9932CC';
const BLUE = '#5D3FD3';

class Element {
	constructor(options) {
		this.x = options.x;
		this.y = options.y;
		this.height = options.height;
		this.width = options.width;
		this.speed = options.x || 2;
		this.gravity = options.x || 2;
		this.color = options.color;
	}
}

const player1 = new Element({
	x: 10,
	y: 300,
	height: 100,
	width: 20,
	color: PINK,
});

const player2 = new Element({
	x: 770,
	y: 300,
	height: 100,
	width: 20,
	color: PINK,
});

function drawElements(element) {
	ctx.fillStyle	= element.color;
	ctx.fillRect(element.x, element.y, element.width, element.height);
}

	const gameBoard	= document.getElementById('gameBoard');
	const ctx		= gameBoard.getContext('2d');
	drawElements(player1);
	drawElements(player2);
	console.log('drawn elements');

