export {
	addPlayer,
	clearPlayerList,
	setPlayerInLobby,
	markPlayerAsReady,
	updateLeaderboard,
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
	checkMark = player.querySelector('.text-end');
	checkMark.classList.add('ready-check');
	checkMark.textContent = '✓';
}

function clearPlayerList() {
	const playerList = document.getElementById('playerList');
	const template = document.getElementById('playerTemplate');

	Array.from(playerList.children).forEach(child => {
		if (child !== template) {
			playerList.removeChild(child);
		}
	});
}

function	addPlayer(username) {
	const playerTemplate = document.getElementById('playerTemplate');
	const list = document.getElementById('playerList');
	const newPlayerElement = playerTemplate.content.firstElementChild.cloneNode(true);

	if (document.getElementById(username)) {
		return;
	}
	newPlayerElement.id = `${username}`;
	const playerName = newPlayerElement.querySelector('.col');
	if (!playerName) {
		console.error('Player name element not found');
		return;
	}
	playerName.innerText = username;

	list.appendChild(newPlayerElement);
}

function updateLeaderboard(Leaderboard) {
	const sortedLeaderboard = Object.entries(Leaderboard).sort(([, pointsA], [, pointsB]) => pointsB - pointsA);
	const playerList = document.getElementById('playerList');

	sortedLeaderboard.forEach(([username, points], index) => {
		const playerElement = document.getElementById(username);
		if (playerElement) {
			const rankContainer = playerElement.querySelector('.text-end');

			if (index === 0) {
				rankContainer.textContent = '🏆';
			} else if (index === 1) {
				rankContainer.textContent = '🥈';
			} else if (index === 2) {
				rankContainer.textContent = '🥉';
			} else {
				rankContainer.textContent = `${index + 1}th place`;
			}
			playerList.removeChild(playerElement);
			playerList.appendChild(playerElement);
		}
	});
}
