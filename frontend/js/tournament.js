import { removeErrorMessage, showErrorMessage } from "./error_handling.js";

window.setPlayerCount = setPlayerCount;
window.setWinningPoints = setWinningPoints;
window.validateCreateLobby = validateCreateLobby;

function	addTournament() {
	const list = document.getElementById('tournamentList');
	// const input = document.getElementById('add-player-name');

	var item = document.createElement('div');
	item.className = 'list-group-item';
	item.textContent = Tournament;
	// input.value = '';

	if (item.textContent != '')
		list.appendChild(item);
	return false;
}

function	setPlayerCount() {
	const playerCount = document.getElementById('playerCount');
	const playerCountDisplay = document.getElementById('playerCountDisplay');

	playerCountDisplay.innerText = playerCount.value;
}

function	setWinningPoints() {
	const winningPoints = document.getElementById('winningPoints');
	const winningPointsDisplay = document.getElementById('winningPointsDisplay');

	winningPointsDisplay.innerText = winningPoints.value;
}

async function	validateCreateLobby() {
	const lobbyId = document.getElementById('createLobbyId');

	removeErrorMessage(lobbyId);
	if (!lobbyId.value.trim()) {
		lobbyId.classList.add('is-invalid');
		showErrorMessage(lobbyId, 'Please enter a lobby ID');
		return false;
	}
	loadPage('tournamentwait');
	return true;
}
