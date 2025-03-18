window.addPlayer = addPlayer;

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

function	modeChangeInput() {
	const id = document.getElementById('createLobbyId');
	const password = document.getElementById('createLobbyPassword');
	const mode = document.getElementById('createLobbyMode');

	if (mode.value === "local")
	{
		id.disabled = true;
		password.disabled = true;
	} else {
		id.disabled = false;
		password.disabled = false;
	}

}
