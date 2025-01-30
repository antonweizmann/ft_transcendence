import { aiLoop, cleanAi, isAi, setAiReaction} from "./ai.js";
console.log('=== Game Script Starting ===');

const PINK = '#8A4FFF';
const PURPLE = '#9932CC';
const BLUE = '#5D3FD3';
let HEIGHTBOARD = 500;
let WIDTHBOARD = 800;
let WIDTHOBJECTS = WIDTHBOARD / 40;
let HEIGHTOBJECTS = HEIGHTBOARD / 5;
let player1, player2, ball;
let gameloop, animationId;
let isAnimating = false;
let eventListeners = [];
export const keysPressed = {};
let scorePlayer1 = 0;
let scorePlayer2 = 0;
let stopDoubleCollision;
let gameButton
let gameModeSelector
export let gameMode;
console.log('game.js started');

function errorHandler(e) {
	console.error('Global error:', e.message);
}

window.addEventListener('error', errorHandler);
eventListeners.push({element: window, type: 'error', listener: errorHandler});
//Class definitions
export class Element {
	constructor(options) {
        this._x = options.x;
        this._y = options.y;
        this._height = options.height;
        this._width = options.width;
        this._speed = options.speed;
        this.dirX = options.dirX;
        this.dirY = options.dirY;
        this.color = options.color;
		this._maxY = options.maxY;
		this._maxX = options.maxX
    }

    get x() { return typeof this._x === 'function' ? this._x() : this._x; }
	set x(value) {
		const maxXValue = typeof this.maxX === 'function' ? this.maxX() : this.maxX;
		this._x = Math.min(maxXValue, Math.max(0, value));
	}
    get y() { return typeof this._y === 'function' ? this._y() : this._y; }
	set y(value) {
		const maxYValue = typeof this.maxY === 'function' ? this.maxY() : this.maxY;
		this._y = Math.min(maxYValue, Math.max(0, value));
	}

    get width() { return typeof this._width === 'function' ? this._width() : this._width; }
    get height() { return typeof this._height === 'function' ? this._height() : this._height; }
    get maxX() { return typeof this._maxX === 'function' ? this._maxX() : this._maxX; }
    get maxY() { return typeof this._maxY === 'function' ? this._maxY() : this._maxY; }
	get speed() { return typeof this._speed === 'function' ? this._speed() : this._speed; }
	set speed(value) {this._speed = value};
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

	let startPlayer1 = {
		x: () => WIDTHBOARD / 80,
		y: () => HEIGHTBOARD / 2 - HEIGHTOBJECTS / 2,
		height: () => HEIGHTOBJECTS,
		width: () => WIDTHOBJECTS,
		maxY: () => HEIGHTBOARD - HEIGHTOBJECTS,
		maxX: () => WIDTHBOARD - WIDTHOBJECTS,
		speed: () => HEIGHTBOARD / 50,
		color: PINK,
	};

	let startPlayer2 = {
		x: () => WIDTHBOARD -  WIDTHBOARD / 80 - WIDTHOBJECTS,
		y: () => HEIGHTBOARD / 2 - HEIGHTOBJECTS / 2,
		height: () => HEIGHTOBJECTS,
		width: () => WIDTHOBJECTS,
		maxY: () => HEIGHTBOARD - HEIGHTOBJECTS,
		maxX: () => WIDTHBOARD - WIDTHOBJECTS,
		speed: () => HEIGHTBOARD / 50,
		color: PINK,
	};
	let startBallValues = {
		x: () => WIDTHBOARD / 2 - WIDTHOBJECTS / 2,
		y: () => HEIGHTBOARD / 2 - HEIGHTOBJECTS / 10,
		height: () => HEIGHTOBJECTS / 5,
		width: () => WIDTHOBJECTS,
		maxY: () => HEIGHTBOARD - HEIGHTOBJECTS / 5,
		maxX: () => WIDTHBOARD - WIDTHOBJECTS,
		speed: () => WIDTHBOARD / 120,
		dirX: Math.round(Math.random()) ? -1 : 1,
		dirY: Math.round(Math.random()) ? -1 : 1,
		color: PURPLE,
	};

    player1 = new Element(startPlayer1);
    player2 = new Element(startPlayer2);
	ball = new Element(startBallValues);

	stopDoubleCollision = ball.dirX;

	ball.reset = function () {
		ball.x = startBallValues.x();
		ball.y = startBallValues.y();
		ball.speed = startBallValues.speed();
		// -1 is to the left and 1 to the right
		ball.dirX = Math.round(Math.random()) ? -1 : 1,
		ball.dirY = Math.round(Math.random()) ? -1 : 1,
		stopDoubleCollision = ball.dirX;
		console.log('Ball was reset');
	}
    player1.reset = function() {
        player1.x = startPlayer1.x();
        player1.y = startPlayer1.y();
    }
    player2.reset = function() {
        player2.x = startPlayer2.x();
        player2.y = startPlayer2.y();
    }
	console.log('Starting game loop with dimensions:', WIDTHBOARD, HEIGHTBOARD);
	setGameBoardSize();
	document.getElementsByClassName('gameButton')[0].addEventListener('click', gameLoop, { once: true });
    gameModeSelector = document.getElementById('gameMode');

    gameModeSelector.addEventListener('change', listenerMode);
	// gameLoop();
}

function listenerMode() {
	// Get the selected value
	gameMode = gameModeSelector.value;
	const difficulty = document.getElementById("difficulty");
	// Take action based on the selected value
	console.log('Selected game mode:', gameMode);
	resetGame();
	if (gameMode === 'human') {
		document.getElementById("player1Name").innerText = "Player 1";
		document.getElementById("player2Name").innerText = "Player 2";
		console.log('Action for Human vs Human');
		gameModeSelector.style.width = '100%';
		difficulty.style.display = "none";
	} else if (gameMode === 'ai') {
		document.getElementById("player2Name").innerText = "AI";
		console.log('Action for Human vs AI');
		if (window.innerWidth > 768)
			gameModeSelector.style.width = '50%';
		difficulty.style.display = "block";
		difficulty.addEventListener('change', setAiReaction);
	} else if (gameMode === 'ai2') {
		document.getElementById("player1Name").innerText = "AI";
		document.getElementById("player2Name").innerText = "AI";
		console.log('Action for AI vs AI');
		gameModeSelector.style.width = '100%';
		difficulty.style.display = "none";
		difficulty.addEventListener('change', setAiReaction);
	}
}

function listenerGame() {
    initGame();
    window.gameState.initialized = true;
	window.gameState.cleanup = cleanupGame;
}

function ensureInit() {
    if (window.gameState.initialized === true) return;

    console.log('Ensuring initialization...');
    if (document.readyState === 'complete') {
        console.log('Document already complete, initializing now');
        initGame();
        window.gameState.initialized = true;
		window.gameState.cleanup = cleanupGame;
    } else {
        console.log('Document not ready, adding listener');
        document.addEventListener('DOMContentLoaded', listenerGame);
    }
}

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

function listenerResize()
{
	const debouncedResize = debounce(() => setGameBoardSize(), 100);
		debouncedResize();
}

window.addEventListener('resize', listenerResize);
eventListeners.push({element: window, type: 'resize', listener: listenerResize});
ensureInit();
window.ensureInit = ensureInit;

//Main Loop
function gameLoop() {
	const gameModeSelector = document.getElementById('gameMode');
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

// Board Size
function setGameBoardSize(isInitialSetup = false) {
    // Set the game board to 80% of the smaller dimension (height or width)
    const  smallerDimension = Math.min(window.innerWidth, window.innerHeight);
    WIDTHBOARD = Math.floor(smallerDimension * 1);
    HEIGHTBOARD = Math.floor(WIDTHBOARD * (5/9)); // Maintain a 8:5 aspect ratio

    // Recalculate other dependent variables
    WIDTHOBJECTS = WIDTHBOARD / 45;
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
	// console.log('Drawing element:', {
    //     x: element.x,
    //     y: element.y,
    //     width: element.width,
    //     height: element.height,
    //     color: element.color
    // });
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

    // console.log('Canvas dimensions:', gameBoard.width, gameBoard.height);
    // console.log('Player 1 position:', player1.x, player1.y);
    // console.log('Drawing elements...');
	ctx.clearRect(0, 0, WIDTHBOARD, HEIGHTBOARD);

	drawElements(ctx, player1);
	drawElements(ctx, player2);
	drawElements(ctx, ball);
}

// Game Controls
function handleMovement() {
	// console.log('Player speed', player1.speed);
	if(keysPressed['w']) {
		console.log('Player 1 Up');
        player1.y -=player1.speed;
    }
    else if(keysPressed['s']) {
		console.log('Player 1 Down');
		player1.y +=player1.speed;
    }
	if(keysPressed['ArrowUp']){
		console.log('Player 2 Up');
        player2.y -=player2.speed;
    }
    else if(keysPressed['ArrowDown']) {
		console.log('Player 2 Down');
		player2.y += player2.speed;
    }
	// console.log('Ball speed', ball.speed);

	//diagonal speed normalized
	const magnitude = Math.sqrt(ball.dirX * ball.dirX + ball.dirY * ball.dirY);
	const normalizedX = ball.dirX / magnitude;
	const normalizedY = ball.dirY / magnitude;

	ball.x += (ball.speed * normalizedX);
	ball.y += (ball.speed * normalizedY);

	ballBounce();

}

function resetScore() {
	scorePlayer1 = 0;
	scorePlayer2 = 0;
	document.getElementById('scoreGame').textContent = `${scorePlayer1} : ${scorePlayer2}`;
}

function increaseScore(player) {
	if (player === 1)
		scorePlayer1++;
	else
		scorePlayer2++;
	document.getElementById('scoreGame').textContent = `${scorePlayer1} : ${scorePlayer2}`;
}

function checkCollision() {
	if (ball.x <= player1.x + player1.width &&
        ball.x + ball.width >= player1.x &&
        ball.y + ball.height >= player1.y &&
        ball.y <= player1.y + player1.height && stopDoubleCollision == -1) {
        ball.dirX *= -1;
        ball.dirY = ((ball.y + ball.height/2) - (player1.y + player1.height/2)) / (player1.height/2);
		if (ball.speed <= WIDTHBOARD / 60)
			ball.speed += WIDTHBOARD / 1000;
		else if (gameMode === "ai2")
			ball.speed += WIDTHBOARD / 1000;
		stopDoubleCollision = 1;
	}
	if (ball.x + ball.width >= player2.x &&
        ball.x <= player2.x + player2.width &&
        ball.y + ball.height >= player2.y &&
        ball.y <= player2.y + player2.height && stopDoubleCollision == 1) {
			ball.dirX *= -1;
			ball.dirY = ((ball.y + ball.height/2) - (player2.y + player2.height/2)) / (player2.height/2);
		if (ball.speed <= WIDTHBOARD / 60)
			ball.speed += WIDTHBOARD / 1000 ;
		else if (gameMode === "ai2")
			ball.speed += WIDTHBOARD / 1000;
		stopDoubleCollision = -1;
    }
}

function ballBounce() {
	if (ball.y == 0)
		ball.dirY *= -1;
	else if (ball.y == ball.maxY)
		ball.dirY *= -1;
	if (ball.x == 0)
	{
		increaseScore(2);
		ball.reset();
	}
	else if (ball.x == ball.maxX)
	{
		increaseScore(1);
		ball.reset();
	}
	checkCollision()
}

function addMovement(event)
{
	if ((gameMode =='ai' || gameMode == 'ai2' ) && !isAi && (event.key === "ArrowUp" || event.key === "ArrowDown"))
		return ;
	else
		keysPressed[event.key] = true;
}
function stopMovement(event){
	delete keysPressed[event.key];
}

document.addEventListener('keydown', addMovement);
document.addEventListener('keyup', stopMovement);
eventListeners.push({element: document, type: 'keydown', listener: addMovement});
eventListeners.push({element: document, type: 'keyup', listener: stopMovement});

