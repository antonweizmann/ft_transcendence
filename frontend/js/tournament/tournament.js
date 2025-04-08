import { removeErrorMessage, showErrorMessage } from "../error_handling.js";
import { LoadDataFromBackend } from "../profile.js";
import {
	joinTournament,
	loadTournament,
	loadTournamentLobby,
	requestTournamentLobbySize
} from "./backend_communication.js";
import { addPlayer, setPlayerInLobby, clearPlayerList } from "./tournament_lobby.js";

// window.setWinningPoints = setWinningPoints;
window.setPlayerCount = setPlayerCount;
window.validateCreateLobby = validateCreateLobby;
window.refreshTournamentList = refreshTournamentList;

export {
	initTournament,
	updateTournament,
	setTournamentData,
	updateLobby
}

function initTournament() {
	if (document.readyState === 'complete') {
		console.log('Document already complete, initializing now');
		loadTournament();
	} else {
		console.log('Document not ready, adding listener');
		document.addEventListener('DOMContentLoaded', loadTournament);
	}
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

async function updateLobby(players, size) {
	console.log('Lobby update:', players);
	const lobbySize = document.getElementById('playerCount').value;
	// const winningPoints = document.getElementById('winningPoints').value;

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
	console.log('Lobby size:', lobbySize);
	requestTournamentLobbySize(lobbySize);
	console.log('size:', size);
	setPlayerInLobby(players.length, lobbySize);
}

function setTournamentData(data) {
	clearTournamentList();
	data.forEach(tournament => {
		addTournament(tournament.name, tournament.id, tournament.player_count, tournament.size);
	});
	console.log("Tournament data received:", data);
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


//  Functions for the sliders
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

// function for the refresh button
function	refreshTournamentList() {
	LoadDataFromBackend('/api/pong/tournament/open/', setTournamentData);
}