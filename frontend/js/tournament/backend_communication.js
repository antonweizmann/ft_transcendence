import { getCookie } from "../cookies.js";
import { updateActive } from "../form_validation.js";
import { closeMobileMenu, fetchPageContent } from "../main.js";
import { sendToTournamentSocket, initTournamentSocket } from "./socket_management.js";
import { updateTournament, setTournamentData } from "./tournament.js";
import { LoadDataFromBackend } from "../profile.js";
import { updateTournamentLobby } from "./tournament.js";

export {
	loadTournament,
	parseTournamentMessage,
	joinTournament,
	loadTournamentLobby,
	requestTournamentLobbySize
};

function loadTournament() {
	console.log("Tournament JS loaded");
	LoadDataFromBackend('/api/pong/tournament/open/', setTournamentData);
	initTournamentSocket();
}

function parseTournamentMessage(data) {
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
	} else if (message.type === 'lobby_update') {
		updateTournamentLobby(message.players, message.size);
	} else {
		if (message.message)
			console.log('Received message:', message.message);
		else if (message.error)
			console.error('Received error:', message.error);
		else
			console.log('Received message:', message);
	}
}

function joinTournament(lobbyId) {
	console.log('Joining tournament:', lobbyId);
	const message = {
		action: 'join_lobby',
		tournament_id: lobbyId,
		player_pk: getCookie('user_id'),
	};
	sendToTournamentSocket(message);
}

async function loadTournamentLobby() {
	closeMobileMenu();
	try {
		const content = await fetchPageContent('tournament_lobby');
		if (content === null)
			return ;
		document.getElementById('main-content').innerHTML = content;
		updateActive('tournament_lobby');
		changeLanguage();
		return true;
	}
	catch (error) {
		console.error('Error loading tournament lobby:', error);
		document.getElementById('main-content').innerHTML = `<p>Error loading tournament lobby. Please try again later.</p>`;
	}
	return false;
}

function requestTournamentLobbySize(Size) {
	const message = {
		action: 'change_size',
		size: Size,
	};
	sendToTournamentSocket(message);
}