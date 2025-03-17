window.addPlayer = addPlayer;

function addTournament() {
	const list = document.getElementById('tournamentList');
	// const input = document.getElementById('add-player-name');

	var item = document.createElement('div');
	item.className = 'list-group-item';
	item.textContent = Tournament;
	// input.value = '';

	if (item.textContent != '')
		list.appendChild(item);
	return false;
}

function setPlayerCount() {
	const playerCount = document.getElementById('playerCount');
	const playerCountDisplaer = document.getElementById('playerCountDisplay');

	playerCountDisplaer.innerText = playerCount.value;
}
