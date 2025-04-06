import { updateActive } from "../form_validation.js";
import { closeMobileMenu, fetchPageContent } from "../main.js";
import { tournamentSocket } from "../tournament.js";

export function joinTournament(lobbyId) {
	console.log('Joining tournament:', lobbyId);
	const message = {
		action: 'join_lobby',
		tournament_id: lobbyId,
		player_pk: localStorage.getItem('user_id'),
	};
	sendToTournamentSocket(message);
}

function sendToTournamentSocket(message) {
	if (tournamentSocket && tournamentSocket.readyState === WebSocket.OPEN) {
		console.log("Sending message to tournament socket:", message);
		tournamentSocket.send(JSON.stringify(message));
	} else {
		console.error('Error: Tournament WebSocket connection is not open');
	}
}

export async function loadTournamentLobby() {
	closeMobileMenu();
	try {
		const content = await fetchPageContent('tournamentwait');
		if (content === null)
			return ;
		document.getElementById('main-content').innerHTML = content;
		updateActive('tournamentwait');
		changeLanguage();
		return true;
	}
	catch (error) {
		console.error('Error loading tournament lobby:', error);
		document.getElementById('main-content').innerHTML = `<p>Error loading tournament lobby. Please try again later.</p>`;
	}
	return false;
}