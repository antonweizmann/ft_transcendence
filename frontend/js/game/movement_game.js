import { ball, player1, player2, BOARD_WIDTH} from "./init_game.js";
import { isAi } from "./ai.js";

export const keysPressed = {};
let scorePlayer1 = 0;
let scorePlayer2 = 0;
let stopDoubleCollision;

export function handleMovement() {
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
	const magnitude = Math.sqrt(ball.dirX * ball.dirX + ball.dirY * ball.dirY);
	const normalizedX = ball.dirX / magnitude;
	const normalizedY = ball.dirY / magnitude;

	ball.x += (ball.speed * normalizedX);
	ball.y += (ball.speed * normalizedY);
	ballBounce();
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
	stopDoubleCollision = ball.dirX;
	checkCollision()
}

function checkCollision() {
	if (ball.x <= player1.x + player1.width &&
		ball.x + ball.width >= player1.x &&
		ball.y + ball.height >= player1.y &&
		ball.y <= player1.y + player1.height &&
		ball.dirX === stopDoubleCollision) {
		ball.dirX *= -1;
		ball.dirY = ((ball.y + ball.height/2) - (player1.y + player1.height/2)) / (player1.height/2);
		if (ball.speed <= BOARD_WIDTH / 60)
			ball.speed += BOARD_WIDTH / 1000;
		else if (gameMode === "ai2")
			ball.speed += BOARD_WIDTH / 1000;
	}
	if (ball.x + ball.width >= player2.x &&
		ball.x <= player2.x + player2.width &&
		ball.y + ball.height >= player2.y &&
		ball.y <= player2.y + player2.height &&
		ball.dirX === stopDoubleCollision) {
			ball.dirX *= -1;
			ball.dirY = ((ball.y + ball.height/2) - (player2.y + player2.height/2)) / (player2.height/2);
		if (ball.speed <= BOARD_WIDTH / 60)
			ball.speed += BOARD_WIDTH / 1000 ;
		else if (gameMode === "ai2")
			ball.speed += BOARD_WIDTH / 1000;
	}
}

export function resetScore() {
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

export function addMovement(event)
{
	if ((gameMode == 'ai' || gameMode == 'ai2' ) && !isAi && (event.key === "ArrowUp" || event.key === "ArrowDown"))
		return ;
	else
		keysPressed[event.key] = true;
}
export function stopMovement(event){
	delete keysPressed[event.key];
}

