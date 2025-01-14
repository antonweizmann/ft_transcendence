// Add this at the very top of game.js
console.log('=== Game Script Starting ===');

// Add this right after your constants
window.addEventListener('error', function(e) {
    console.error('Global error:', e.message);
});

const PINK = '#8A4FFF';
const PURPLE = '#9932CC';
const BLUE = '#5D3FD3';
let HEIGHTBOARD = 500;
let WIDTHBOARD = 800;
let WIDTHOBJECTS = WIDTHBOARD / 40;
let HEIGHTOBJECTS = HEIGHTBOARD / 5;
let player1, player2, ball;
console.log('game.js started');
class Element {
    constructor(options) {
        // Store the functions/values
        this._x = options.x;
        this._y = options.y;
        this._height = options.height;
        this._width = options.width;
        this.speed = 2;
        this.gravity = 2;
        this.color = options.color;
    }

    // Use getters to evaluate positions dynamically
    get x() { return typeof this._x === 'function' ? this._x() : this._x; }
    get y() { return typeof this._y === 'function' ? this._y() : this._y; }
    get width() { return typeof this._width === 'function' ? this._width() : this._width; }
    get height() { return typeof this._height === 'function' ? this._height() : this._height; }
}

function gameLoop() {
	updateElements();
	requestAnimationFrame(gameLoop);
}

function initGame() {
	console.log('=== Initializing Game ===');
    const gameBoard = document.getElementById('gameBoard');
	console.log('Canvas element found:', !!gameBoard);

    if (!gameBoard) {
        console.error('Canvas element not found');
        return;
    }

    setGameBoardSize(true);
    const ctx = gameBoard.getContext('2d');
    // Rest of your game initialization code

	player1 = new Element({
		x: () => WIDTHBOARD / 80,
		y: () => HEIGHTBOARD / 2 - HEIGHTOBJECTS / 2,
		height: () => HEIGHTOBJECTS,
		width: () => WIDTHOBJECTS,
		color: PINK,
	});

	player2 = new Element({
		x: () => WIDTHBOARD -  WIDTHBOARD / 80 - WIDTHOBJECTS,
		y: () => HEIGHTBOARD / 2 - HEIGHTOBJECTS / 2,
		height: () => HEIGHTOBJECTS,
		width: () => WIDTHOBJECTS,
		color: PINK,
	});
	ball = new Element ({
		x: () => WIDTHBOARD / 2 - WIDTHOBJECTS / 2,
		y: () => HEIGHTBOARD / 2 - HEIGHTOBJECTS / 10,
		height: () => HEIGHTOBJECTS / 5,
		width: () => WIDTHOBJECTS,
		color: PURPLE,
	});
	console.log('Starting game loop with dimensions:', WIDTHBOARD, HEIGHTBOARD);

	gameLoop();
	// updateElements()
}

// // Functions Start

function setGameBoardSize(isInitialSetup = false) {
    // Set the game board to 80% of the smaller dimension (height or width)
    const  smallerDimension = Math.min(window.innerWidth, window.innerHeight);
    WIDTHBOARD = Math.floor(smallerDimension * 0.8);
    HEIGHTBOARD = Math.floor(WIDTHBOARD * 0.625); // Maintain a 8:5 aspect ratio

    // Recalculate other dependent variables
    WIDTHOBJECTS = WIDTHBOARD / 40;
    HEIGHTOBJECTS = HEIGHTBOARD / 5;
	const gameBoard = document.getElementById('gameBoard');
    if (gameBoard) {
        gameBoard.width = WIDTHBOARD;
        gameBoard.height = HEIGHTBOARD;
        // updateElements(); // Redraw after resize
		console.log('Canvas resized to:', WIDTHBOARD, HEIGHTBOARD);
		if (!isInitialSetup)
			updateElements();
    }
}

function drawElements(ctx, element) {
	console.log('Drawing element:', {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        color: element.color
    });
	ctx.fillStyle	= element.color;
	ctx.fillRect(element.x, element.y, element.width, element.height);
}

function updateElements(){
    const gameBoard = document.getElementById('gameBoard');
    if (!gameBoard) {
        console.error('Canvas not found in updateElements');
        return;
    }
    const ctx = gameBoard.getContext('2d');

    console.log('Canvas dimensions:', gameBoard.width, gameBoard.height);
    console.log('Player 1 position:', player1.x, player1.y);
    console.log('Drawing elements...');
	ctx.clearRect(0, 0, WIDTHBOARD, HEIGHTBOARD);

	drawElements(ctx, player1);
	drawElements(ctx, player2);
	drawElements(ctx, ball);
	console.log('drawn elements');
}


// At the bottom of game.js, replace your current initialization with:
// function ensureInit() {
//     console.log('Ensuring initialization...');
//     if (document.readyState === 'complete') {
//         console.log('Document already complete, initializing now');
//         initGame();
//     } else {
//         console.log('Document not ready, adding listeners');
//         document.addEventListener('DOMContentLoaded', initGame, { once: true });
//     }
// }
let gameInitialized = false;

function ensureInit() {
    if (gameInitialized) return;

    console.log('Ensuring initialization...');
    if (document.readyState === 'complete') {
        console.log('Document already complete, initializing now');
        initGame();
        gameInitialized = true;
    } else {
        console.log('Document not ready, adding listener');
        document.addEventListener('DOMContentLoaded', () => {
            initGame();
            gameInitialized = true;
        }, { once: true });
    }
}
// Add this near the top of your file with other utilities
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Then update your resize listener
window.addEventListener('resize', debounce(() => setGameBoardSize(), 100));
ensureInit();
