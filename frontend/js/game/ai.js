import {keysPressed} from './game.js'
import { gameMode } from './init_game.js';

let predictedY;
let fov ;
export let isAi = false;


export function aiLoop(ball, paddle, key1, key2) {
	setAiReaction(ball);
	predictedY = calculateBallMovement(ball, paddle);
	if (predictedY < paddle.y)
		simulateKeyPress(key1);
	else if (predictedY >= paddle.y + paddle.height)
		simulateKeyPress(key2);
}

function setAiReaction(ball) {
	difficulty = document.getElementById("difficulty");
	if (difficulty.value === "easy")
		fov = ball.maxX / 4;
	else if (difficulty.value === "medium")
		fov = ball.maxX / 2;
	else if (difficulty.value === "hard")
		fov = ball.maxX;
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
	if (gameMode === "ai" && distanceToBall > fov) return paddle.y;
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
		if (gameMode === "ai")
		{
			difficulty = document.getElementById("difficulty");
			if (difficulty.value === 'easy') predictedY += (Math.random() - 0.5) * (paddle.height * 20);
			if (difficulty.value === 'medium') predictedY += (Math.random() - 0.5) * (paddle.height * 10);
		}
	}
	return predictedY;
}
