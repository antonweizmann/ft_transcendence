export {
	addPlayer,
	clearPlayerList,
	setPlayerInLobby,
	markPlayerAsReady,
	tournamentOver,
};

function	setPlayerInLobby(amount, total) {
	const playerCount = document.getElementById('playerCount');

	playerCount.innerText = amount + "/" + total;
}

function markPlayerAsReady(username) {
	const player = document.getElementById(`${username}`);
	let checkMark;

	if (!player)
		return;
	if (player.querySelector('.ready-check'))
		return;
	checkMark = document.createElement('span');
	checkMark.classList.add('ready-check', 'col-sm', 'w-50');
	checkMark.textContent = '✓';
	player.appendChild(checkMark);
}

function	clearPlayerList() {
	document.getElementById('playerList').innerHTML = '';
}

function	addPlayer(username) {
	const list = document.getElementById('playerList');
	var item = document.getElementById('playerExample').cloneNode(true);

	item.id = `${username}`;
	item.style = 'display: block;';
	item.querySelector('span').textContent = username;

	if (item.textContent != '')
		list.appendChild(item);
}

function tournamentOver(Leaderboard) {
	// Convert the Leaderboard object into an array of [username, points] pairs and sort it by points in descending order
	const sortedLeaderboard = Object.entries(Leaderboard).sort(([, pointsA], [, pointsB]) => pointsB - pointsA);
	const playerList = document.getElementById('playerList');
	// Iterate over the sorted leaderboard and update the DOM
	sortedLeaderboard.forEach(([username, points], index) => {
		const playerElement = document.getElementById(username);
		if (playerElement) {
			const readyCheck = playerElement.querySelector('.ready-check');
			let rank;

			if (readyCheck) {
				readyCheck.remove();
			}
			if (index === 0) {
				rank = "First place";
			} else if (index === 1) {
				rank = "Second place";
			} else if (index === 2) {
				rank = "Third place";
			} else {
				rank = `${index + 1}th place`;
			}
			playerElement.querySelector('span').textContent = `${rank}: ${username}`;
			playerList.removeChild(playerElement);
			playerList.appendChild(playerElement);
		}
	});
}