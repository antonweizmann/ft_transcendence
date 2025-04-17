import { changeGameMode, ensureInit, startGameTimer } from '../game/init_game.js';
import { joinGame } from '../game/online_game.js';
import { fetchPageContent } from '../main.js';
import { deactivateButton, reactivateButton } from '../utils.js';

export {
	initTournamentMatch,
}

async function initTournamentMatch(match_id, players) {
	const pong_game = document.getElementById('pong_game');

	if (!pong_game) {
		setTimeout(() => { initTournamentMatch(match_id, players); }, 500);
		return;
	}
	console.log('Initializing tournament match:', match_id, players);
	if (pong_game.innerHTML === '') {
		console.log('Loading tournament match page');
		pong_game.innerHTML = await fetchPageContent('play');
		ensureInit();
	}
	setBoardForTournament(match_id, players);
}

function setBoardForTournament(match_id, players) {
	const gameModeSelector = document.getElementById('gameMode');
	const lobbyId = document.getElementById('lobbyId');
	const winningScreen = document.getElementById('winningScreen');
	const lobbyInput = document.getElementById("lobbyInput");
	const startButtonContainer = document.getElementById('startButtonContainer');

	lobbyId.value = match_id;
	gameModeSelector.value = 'online';
	gameModeSelector.style.display = 'none';
	lobbyInput.style.display = "none";
	changeGameMode();
	winningScreen.innerHTML = '';
	reactivateButton('startGame', startGameTimer);
	startButtonContainer.classList.remove('col-md');
	setTimeout(() => {
		if (players.includes(localStorage.getItem('username'))) {
			joinGame();
		}
		else {
			deactivateButton('startGame');
			setTimeout(joinGame, 500);
		}
	}, 500);
}