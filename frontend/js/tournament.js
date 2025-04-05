window.setPlayerCount = setPlayerCount;
window.setWinningPoints = setWinningPoints;

function	addTournament() {
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
