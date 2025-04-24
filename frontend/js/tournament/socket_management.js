import { refreshAccessToken } from '../authentication.js';
import { parseTournamentMessage } from './backend_communication.js';

export {
	initTournamentSocket,
	sendToTournamentSocket,
	tournamentSocket
};

window.resetTournamentSocket = resetTournamentSocket;

let	tournamentSocket;

async function initTournamentSocket() {
	if (tournamentSocket) {
		console.warn('Tournament Socket already exists');
		return;
	}
	await refreshAccessToken();
	tournamentSocket = new WebSocket('wss://localhost/ws/tournament/');
	tournamentSocket.onopen = () => {
		console.log('Requesting tournament connection');
	};
	tournamentSocket.onmessage = (event) => {
		parseTournamentMessage(event.data);
	};
	tournamentSocket.onerror = (error) => {
		console.error('Tournament WebSocket Error:', error);
	};
	tournamentSocket.onclose = () => {
		console.log('Tournament WebSocket connection closed');
	};
}

function resetTournamentSocket() {
	if (tournamentSocket && tournamentSocket.readyState === WebSocket.OPEN) {
		tournamentSocket.close();
	}
	tournamentSocket = null;
}

function sendToTournamentSocket(message) {
	if (tournamentSocket && tournamentSocket.readyState === WebSocket.OPEN) {
		console.log("Sending message to tournament socket:", message);
		tournamentSocket.send(JSON.stringify(message));
	} else {
		console.error('Error: Tournament WebSocket connection is not open');
	}
}