import { removeErrorMessage, showErrorMessage } from "./error_handling.js";

window.setPlayerCount = setPlayerCount;
window.setWinningPoints = setWinningPoints;
window.validateCreateLobby = validateCreateLobby;
window.addTournament = addTournament;
window.clearTournamentList = clearTournamentList;

function	addTournament(id, amount, totalAmount) {
	const list = document.getElementById('tournamentList');
	var item = document.getElementById('tournamentExample').cloneNode(true);

	item.id = '';
	item.style = 'display: block;';
	item.querySelector('.col-3 div').textContent = id;
	item.querySelector('.col-1 div').textContent = `${amount}/${totalAmount}`;
	item.querySelector('.button').addEventListener('click', function() {
		joinTournament(id);
	});

	if (item.textContent != '')
		list.appendChild(item);
}

function	joinTournament(id) {
	console.log('Joining tournament with ID:', id);
}

function	clearTournamentList() {
	document.getElementById('tournamentList').innerHTML = '';
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
