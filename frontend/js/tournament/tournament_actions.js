import { addPlayer, setPlayerInLobby, clearPlayerList } from "./tournament_lobby.js";
import { loadTournamentLobby, requestTournamentLobbySize, joinTournament, setPlayerReady } from "./backend_communication.js";
import { removeErrorMessage, showErrorMessage } from "../error_handling.js";
import { clearTournamentList, setTournamentData } from "./tournament.js";
import { LoadDataFromBackend } from "../profile.js";

export {
	updateTournamentLobby
};

// window.setWinningPoints = setWinningPoints;
window.refreshTournamentList = refreshTournamentList;
window.setPlayerCount = setPlayerCount;
window.validateCreateLobby = validateCreateLobby;
window.readyUp = setPlayerReady;

let newLobbySize = null;

async function updateTournamentLobby(players, size) {
	const inLobby = await loadTournamentLobby();

	if (!inLobby) {
		console.error('Error loading tournament lobby');
		return;
	}
	clearPlayerList();
	players.forEach(player => {
		const { username } = player;
		addPlayer(username);
	});
	if (newLobbySize && newLobbySize !== size) {
		console.log('Lobby size:', newLobbySize);
		requestTournamentLobbySize(newLobbySize);
		size = newLobbySize;
		newLobbySize = null;
	}
	setPlayerInLobby(players.length, size);
}

// functions for the buttons

function	refreshTournamentList() {
	clearTournamentList();
	LoadDataFromBackend('/api/pong/tournament/open/', setTournamentData);
}

function	validateCreateLobby() {
	const lobbyId = document.getElementById('createLobbyId');

	removeErrorMessage(lobbyId);
	if (!lobbyId.value.trim()) {
		lobbyId.classList.add('is-invalid');
		showErrorMessage(lobbyId, 'Please enter a lobby ID');
		return false;
	}
	joinTournament(lobbyId.value);
	newLobbySize = document.getElementById('playerCount').value;
}

// Functions for the sliders

function	setPlayerCount() {
	const playerCount = document.getElementById('playerCount');
	const playerCountDisplay = document.getElementById('playerCountDisplay');

	playerCountDisplay.innerText = playerCount.value;
}

// function	setWinningPoints() {
// 	const winningPoints = document.getElementById('winningPoints');
// 	const winningPointsDisplay = document.getElementById('winningPointsDisplay');

// 	winningPointsDisplay.innerText = winningPoints.value;
// }
