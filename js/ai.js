import {Element} from './game.js'

let predictedY;

export function aiLoop(ball, paddle) {
	console.log('AiStarted');
	if (ball.dirX == 1)
	{
	predictedY = calculateBallMovement(ball, paddle);
	// console.log(predictedY);
	// while (predictedY <= paddle.y || predictedY >= paddle.y + paddle.height)
	// {
	// 	if (predictedY <= paddle.y)
	// 		simulateKeyPress('ArrowDown');
	// 	else if (predictedY >= paddle.y + paddle.height)
	// 		simulateKeyPress('ArrowUp');
	// }
	if (predictedY < paddle.y) {
		paddle.y -= paddle.speed; // Define `paddle.speed` for the AI paddle
	} else if (predictedY > paddle.y + paddle.height) {
		paddle.y += paddle.speed;
	}

	// Ensure paddle stays within game boundaries
	paddle.y = Math.max(0, Math.min(paddle.y, ball.maxY - paddle.height));
	}
}

function simulateKeyPress(key) {
	const event = new KeyboardEvent("keydown", {key});
	document.dispatchEvent(event);
}

function calculateBallMovement(ball, paddle) {
	const magnitude = Math.sqrt(ball.dirX * ball.dirX + ball.dirY * ball.dirY);
	const normalizedX = ball.dirX / magnitude;
	const normalizedY = ball.dirY / magnitude;
	let ballVx = ball.speed * normalizedX
	let ballVy = ball.speed * normalizedY
	let timeToCollision = (paddle.x - ball.x) / ballVx;

	predictedY = ball.y + (timeToCollision * ballVy);
	console.log(predictedY);
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
