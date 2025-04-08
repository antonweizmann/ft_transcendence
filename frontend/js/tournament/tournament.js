import { joinTournament, loadTournament, } from "./backend_communication.js";

export {
	initTournament,
	updateTournament,
	setTournamentData,
	clearTournamentList
}

function	initTournament() {
	if (document.readyState === 'complete') {
		console.log('Document already complete, initializing now');
		loadTournament();
	} else {
		console.log('Document not ready, adding listener');
		document.addEventListener('DOMContentLoaded', loadTournament);
	}
}

function	updateTournament(tournament_state) {
	const tournamentList = document.getElementById('tournamentList');
	tournamentList.innerHTML = '';

	for (const tournament of tournament_state) {
		const item = document.createElement('div');
		item.className = 'list-group-item';
		item.textContent = tournament.name;
		tournamentList.appendChild(item);
	}
}

function	setTournamentData(data) {
	clearTournamentList();
	data.forEach(tournament => {
		addTournament(tournament.name, tournament.lobby_id, tournament.player_count, tournament.size);
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
