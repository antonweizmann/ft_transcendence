export {
	addPlayer,
	clearPlayerList,
	setPlayerInLobby,
	markPlayerAsReady,
	showToast,
	tournamentOver,
};

function	setPlayerInLobby(amount, total) {
	const playerCount = document.getElementById('playerCount');

	playerCount.innerText = amount + "/" + total;
}

function markPlayerAsReady(username) {
	const player = document.getElementById(`${username}`);
	if (!player)
		return;

	let checkMark = player.querySelector('.ready-check');

	if (!checkMark) {
		checkMark = document.createElement('span');
		checkMark.className = 'ready-check';
		checkMark.textContent = ' ✅';
		player.appendChild(checkMark);
	}
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

function showToast(title, message) {
	const toastTitle = document.getElementById('toastTitle');
	const toastMessage = document.getElementById('toastMessage');
	const toastTime = document.getElementById('toastTime');
	const toastElement = document.getElementById('liveToast');

	// Set the title and message
	toastTitle.textContent = title;
	toastMessage.textContent = message;
	toastTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

	// Initialize and show the toast
	const toast = new bootstrap.Toast(toastElement);
	toast.show();
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
            playerElement.querySelector('div').textContent = `${rank}: ${username} - ${points} points`;
        }
    });
}