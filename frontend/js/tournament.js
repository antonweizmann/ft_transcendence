import { removeErrorMessage, showErrorMessage } from "./error_handling.js";
import { LoadDataFromBackend } from "./profile.js";

console.log("Tournament JS pre-loaded");

export let	tournamentSocket;

window.setPlayerCount = setPlayerCount;
window.setWinningPoints = setWinningPoints;
window.validateCreateLobby = validateCreateLobby;
window.addTournament = addTournament;
window.clearTournamentList = clearTournamentList;

export function initTournament() {
	if (document.readyState === 'complete') {
		console.log('Document already complete, initializing now');
		loadTournament();
	} else {
		console.log('Document not ready, adding listener');
		document.addEventListener('DOMContentLoaded', loadTournament);
	}
}

function loadTournament() {
	console.log("Tournament JS loaded");

	// ? TODO add loading class to tournament list container

	LoadDataFromBackend('/api/pong/tournament/open/', setTournamentData);
	initTournamentSocket();
}

function setTournamentData(data) {
	// ? create container for tournament list with data from backend
	console.log("Tournament data received:", data);
}

function initTournamentSocket() {
	if (tournamentSocket) {
		console.warn('Tournament Socket already exists');
		return;
	}
	tournamentSocket = new WebSocket('wss://localhost/ws/tournament/');
	tournamentSocket.onopen = () => {
		console.log('Tournament WebSocket connection established');
	};
	tournamentSocket.onmessage = (event) => {
			parseMessage(event.data);
	};
	tournamentSocket.onerror = (error) => {
		console.error('Tournament WebSocket Error:', error);
	};
	tournamentSocket.onclose = () => {
		console.log('Tournament WebSocket connection closed');
	};
}

function parseMessage(data) {
	let message;

	try {
		message = JSON.parse(data);
	} catch (error) {
		console.error('Error parsing message:', error);
		return;
	}
	console.log('Parsed message:', message);
	if (message.type === 'tournament_update') {
		updateTournament(message.tournament_state);
	} else if (message.type === 'game_over') {
		gameOver(message.game_state);
	} else if (message.type === 'lobby_update') {
		updateLobby(message.players);
	} else {
		if (message.message)
			console.log('Received message:', message.message);
		else
			console.log('Received message:', message);
	}
}

function gameOver(game_state) {
	console.log('Game over:', game_state);
	resetTournamentSocket();
}

function updateLobby(players) {
	console.log('Lobby update:', players);
}

function updateTournament(tournament_state) {
	const tournamentList = document.getElementById('tournamentList');
	tournamentList.innerHTML = '';

	for (const tournament of tournament_state) {
		const item = document.createElement('div');
		item.className = 'list-group-item';
		item.textContent = tournament.name;
		tournamentList.appendChild(item);
	}
}

function resetTournamentSocket() {
	if (tournamentSocket && tournamentSocket.readyState === WebSocket.OPEN) {
		tournamentSocket.close();
	}
	tournamentSocket = null;
}

function	addTournament() {
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
