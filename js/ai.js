import {Element, keysPressed, gameMode} from './game.js'

let predictedY;
let reactionTime = 150;
let lastAiMoveTime = 0;

export let isAi = false;


export function aiLoop(ball, paddle, key1, key2) {
	// const now = Date.now();
	// if (now - lastAiMoveTime < reactionTime) return;
	// lastAiMoveTime = now;
	predictedY = calculateBallMovement(ball, paddle);
	if (predictedY < paddle.y)
		simulateKeyPress(key1);
	else if (predictedY >= paddle.y + paddle.height)
		simulateKeyPress(key2);
}

export function setAiReaction(event) {
	console.log('ai reacton')
	if (event.value === "easy")
		reactionTime = 150;
	else if (event.value === "medium")
		reactionTime = 75;
	else if (event.value === "hard")
		reactionTime = 0;
}

function simulateKeyPress(key) {
	const event = new KeyboardEvent("keydown", {key});
	isAi = true;
	document.dispatchEvent(event);
}

export function cleanAi() {
	let key;
	if(keysPressed['ArrowUp'])
		key = "ArrowUp";
    else if(keysPressed['ArrowDown'])
		key = "ArrowDown";
	if (gameMode == 'ai2')
	{
		if (keysPressed['w'])
			key = 'w';
		else if (keysPressed['s'])
			key = 's';
	}
	if (key)
	{
		const stopEvent = new KeyboardEvent("keyup", {key});
		isAi = false;
		document.dispatchEvent(stopEvent);
	}
}

function calculateBallMovement(ball, paddle) {
	let distanceToBall = paddle.x - ball.x;
	const fov = gameMode === 'easy' ? ball.maxX / 4 : gameMode === 'medium' ? ball.maxX / 2 : ball.maxX;
	if (distanceToBall > fov) return paddle.y;
	console.log('fov breached');
	const magnitude = Math.sqrt(ball.dirX * ball.dirX + ball.dirY * ball.dirY);
	const normalizedX = ball.dirX / magnitude;
	const normalizedY = ball.dirY / magnitude;
	let ballVx = ball.speed * normalizedX
	let ballVy = ball.speed * normalizedY
	let timeToCollision = (paddle.x - ball.x) / ballVx;

	predictedY = ball.y + (timeToCollision * ballVy);
	while (predictedY < 0 || predictedY > ball.maxY) {
		if (predictedY < 0) {
			// Ball bounces off the top wall
			predictedY = -predictedY;
		} else if (predictedY > ball.maxY) {
			// Ball bounces off the bottom wall
			predictedY = 2 * ball.maxY - predictedY;
		}
	}
	return predictedY;
}
