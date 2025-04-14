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
	checkMark = player.querySelector('.ready-check');
	if (checkMark) 
		return checkMark.style = 'display: block;';
	checkMark = document.createElement('span');
	checkMark.className = 'ready-check col-sm w-50';
	checkMark.innerText = '✓';
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
	item.querySelector('div').textContent = username;

	if (item.textContent != '')
		list.appendChild(item);
}

function tournamentOver(Leaderboard) {
	// Convert the Leaderboard object into an array of [username, points] pairs and sort it by points in descending order
	const sortedLeaderboard = Object.entries(Leaderboard).sort(([, pointsA], [, pointsB]) => pointsB - pointsA);

	// Iterate over the sorted leaderboard and update the DOM
	sortedLeaderboard.forEach(([username, points], index) => {
		const playerElement = document.getElementById(username);
		if (playerElement) {
			// Remove the ready-check element if it exists
			const readyCheck = playerElement.querySelector('.ready-check');
			if (readyCheck) {
				readyCheck.remove();
			}

			// Determine the rank (e.g., "First place", "Second place", etc.)
			let rank;
			if (index === 0) {
				rank = "First place";
			} else if (index === 1) {
				rank = "Second place";
			} else if (index === 2) {
				rank = "Third place";
			} else {
				rank = `${index + 1}th place`;
			}

			// Update the player's display with their rank, username, and score
			playerElement.querySelector('div').textContent = `${rank}: ${username} - ${points} Match won`;
		}
	});
}