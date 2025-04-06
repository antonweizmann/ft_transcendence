import { removeErrorMessage, showErrorMessage } from "./error_handling.js";
import { LoadDataFromBackend } from "./profile.js";
import { joinTournament, loadTournamentLobby } from "./tournament/backend_communication.js";

console.log("Tournament JS pre-loaded");

export let	tournamentSocket;

window.setPlayerCount = setPlayerCount;
window.setWinningPoints = setWinningPoints;
window.validateCreateLobby = validateCreateLobby;
window.addTournament = addTournament;
window.clearTournamentList = clearTournamentList;
window.addPlayer = addPlayer;
window.clearPlayerList = clearPlayerList;
window.refreshTournamentList = refreshTournamentList;

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
	clearTournamentList();
	data.forEach(tournament => {
		addTournament(tournament.name, tournament.id, tournament.player_count, tournament.size);
	});
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

// Lobby update: 
// Array [ {…} ]
// ​
// 0: Object { index: 0, username: "default" }
// ​​
// index: 0
// ​​
// username: "default"
// ​​
// <prototype>: Object { … }
// ​
// length: 1
async function updateLobby(players) {
	console.log('Lobby update:', players);
	const playerAmount = document.getElementById('playerCountDisplay').value;
	const winningPoints = document.getElementById('winningPointsDisplay').value;

	const inLobby = await loadTournamentLobby();
	if (!inLobby) {
		console.error('Error loading tournament lobby');
		return;
	}
	clearPlayerList();
	players.forEach(player => {
		const { index, username } = player;
		console.log(`Player Index: ${index}, Username: ${username}`);
		addPlayer(username);
	});
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

function	addTournament(name, id, amount, totalAmount) {
	const list = document.getElementById('tournamentList');
	var item = document.getElementById('tournamentExample').cloneNode(true);

	item.id = '';
	item.style = 'display: block;';
	item.querySelector('.col-3 div').textContent = name;
	item.querySelector('.col-1 div').textContent = `${amount}/${totalAmount}`;
	item.querySelector('.button').addEventListener('click', function() {
		joinTournament(id);
	});

	if (item.textContent != '')
		list.appendChild(item);
}

function	clearTournamentList() {
	document.getElementById('tournamentList').innerHTML = '';
}

function	refreshTournamentList() {
	LoadDataFromBackend('/api/pong/tournament/open/', setTournamentData);
}

function	addPlayer(id) {
	const list = document.getElementById('playerList');
	var item = document.getElementById('playerExample').cloneNode(true);

	item.id = '';
	item.style = 'display: block;';
	item.querySelector('div').textContent = id;

	if (item.textContent != '')
		list.appendChild(item);
}

function	clearPlayerList() {
	document.getElementById('playerList').innerHTML = '';
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

function	validateCreateLobby() {
	const lobbyId = document.getElementById('createLobbyId');

	removeErrorMessage(lobbyId);
	if (!lobbyId.value.trim()) {
		lobbyId.classList.add('is-invalid');
		showErrorMessage(lobbyId, 'Please enter a lobby ID');
		return false;
	}
	joinTournament(lobbyId.value);
}
