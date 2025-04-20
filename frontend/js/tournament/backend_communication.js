import { deactivateButton, getCookie, reactivateButton } from "../utils.js";
import { updateActive } from "../form_validation.js";
import { closeMobileMenu, fetchPageContent } from "../main.js";
import { sendToTournamentSocket, initTournamentSocket } from "./socket_management.js";
import { setTournamentData } from "./tournament.js";
import { LoadDataFromBackend } from "../profile.js";
import { updateTournamentLobby } from "./tournament_actions.js";
import { showErrorInAllFields } from "../error_handling.js";
import { setPlayerInLobby, markPlayerAsReady, tournamentOver, updateLeaderboard } from "./tournament_lobby.js";
import { initTournamentMatch } from "./tournament_loop.js";
import { showToast } from "../utils.js";
import { changeLanguage } from "../translations.js";

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
	if (message.type === 'pong_tournament_update') {
		updateTournamentState(message.tournament_state);
	} else if (message.type === 'lobby_update') {
		updateTournamentLobby(message.players, message.size);
	} else if (message.type === 'size_update') {
		setPlayerInLobby(message.player_count, message.size);
	} else if (message.type === 'ready_update') {
		setPlayersReady(JSON.parse(message.players_ready));
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

function updateTournamentState(tournamentState) {
	const	currentMatch = tournamentState.current_match;
	let		players;
	let		match_id;

	setTimeout(() => {
		updateLeaderboard(tournamentState.leaderboard);
		const readyButton = document.getElementById('readyButton');

		if (readyButton)
			readyButton.style.display = 'none';
	}, 100);
	if (!currentMatch) {
		tournamentOver(tournamentState.leaderboard);
		return;
	}
	// Add pending Matches
	match_id = Object.keys(currentMatch)[0];
	players = currentMatch[match_id];
	initTournamentMatch(match_id, players);
}

function setPlayersReady(playersReady) {
	if (document.getElementById('pong_game').innerHTML !== '') {
		console.log('Game already started, not setting players ready');
		return ;
	}
	for (const player in playersReady) {
		if (playersReady[player] === true) {
			markPlayerAsReady(player);
			if (player === localStorage.getItem('username'))
				deactivateButton('readyButton');
		} else if (player === localStorage.getItem('username')) {
			reactivateButton('readyButton', setPlayerReady);
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