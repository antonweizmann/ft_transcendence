import { changeLanguage } from "./translations.js";

export {
	showWinningScreen
}

function showWinningScreen(winningScreenID, scores, onClickPage) {
	const winningScreen = document.getElementById(winningScreenID);
	const sortedScores = Object.entries(scores).sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
	const winner = sortedScores[0][0] === sortedScores[1][0] ? null : sortedScores[0][0];

	if (!winningScreen) {
		console.error('Winning screen element not found');
		return;
	}
	winningScreen.classList.add("winning-screen");
	winningScreen.innerHTML = `
		<h1>🏆 <span data-translate="gameOver">GAME OVER</span> 🏆</h1>`;
	winningScreen.appendChild(getWinnerElement(winner));
	if (onClickPage) {
		winningScreen.onclick = () => { window.loadPage(onClickPage); };
	}
	changeLanguage();
}

function getWinnerElement(winner) {
	const winnerContainer = document.createElement('h2');
	if (!winner) {
		winnerContainer.innerHTML = '<span data-translate="draw">Draw!</span>';
		return winnerContainer;
	}
	winner = winner.charAt(0).toUpperCase() + winner.slice(1);
	winnerContainer.innerHTML = `🎉 ${winner} <span data-translate="won">won</span>! 🎉`;
	return winnerContainer;
}