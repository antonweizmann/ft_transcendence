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