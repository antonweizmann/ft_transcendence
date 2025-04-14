import { deactivateButton, getCookie } from "../utils.js";
import { updateActive } from "../form_validation.js";
import { closeMobileMenu, fetchPageContent } from "../main.js";
import { sendToTournamentSocket, initTournamentSocket } from "./socket_management.js";
import { updateTournament, setTournamentData } from "./tournament.js";
import { LoadDataFromBackend } from "../profile.js";
import { updateTournamentLobby } from "./tournament_actions.js";
import { showErrorInAllFields } from "../error_handling.js";
import { setPlayerInLobby, markPlayerAsReady, tournamentOver } from "./tournament_lobby.js";
import { initTournamentMatch } from "./tournament_loop.js";
import { showToast } from "../utils.js";

export {
	loadTournament,
	parseTournamentMessage,
	joinTournament,
	loadTournamentLobby,
	requestTournamentLobbySize,
	setPlayerReady,
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
	} else if (message.type === 'size_update') {
		console.log(message.details);
		setPlayerInLobby(message.player_count, message.size);
	} else if (message.type === 'ready_update') {
		setPlayersReady(JSON.parse(message.players_ready));
	} else if (message.type === 'pong_tournament_update') {
		setTimeout(() => { deactivateButton('readyButton'); }, 500);
		console.log(message.tournament_state);
		const currentMatch = message.tournament_state.current_match;
		if (!currentMatch) {
			tournamentOver(message.tournament_state.leaderboard);
			return;
		}
		const match_id = Object.keys(currentMatch)[0]; // Get the first key as match_id
		const players = currentMatch[match_id];
		initTournamentMatch(match_id, players);
	} else if (message.type === 'error') {
		console.log('Error:', message.details);
		showToast('Error', message.details);
	} else if (message.error) {
		showErrorInAllFields([{field: document.getElementById('createLobbyId')}], "Lobby ID must be under 100 characters and contain only alphanumerics, hyphens, underscores, or periods.");
		console.error('Received error:', message.error);
	} else if (message.message) {
		showToast('Message', message.message);
		console.log('Received message:', message.message);
	}
	else
		console.log('Received message:', message);
}

function setPlayersReady(playersReady) {
	for (const player in playersReady) {
		if (playersReady[player] === true) {
			markPlayerAsReady(player);
			if (player === localStorage.getItem('username'))
				deactivateButton('readyButton');
		}
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

function setPlayerReady() {
	const message = {
		action: 'start_tournament',
		player_pk: getCookie('user_id'),
	};
	sendToTournamentSocket(message);
}