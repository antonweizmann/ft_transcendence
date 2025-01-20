import {Element, keysPressed} from './game.js'

let predictedY;
export let isAi = false;
export function aiLoop(ball, paddle) {
	// console.log('AiStarted');
	if (ball.dirX == 1)
	{
	predictedY = calculateBallMovement(ball, paddle);
	// console.log(predictedY);
	if (predictedY <= paddle.y)
		simulateKeyPress("ArrowUp");
	else if (predictedY >= paddle.y + paddle.height)
		simulateKeyPress("ArrowDown");

	}
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
	if (key)
	{
		const stopEvent = new KeyboardEvent("keyup", {key});
		isAi = false;
		document.dispatchEvent(stopEvent);
	}
}

function calculateBallMovement(ball, paddle) {
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
