export {
	addPlayer,
	clearPlayerList,
	setPlayerInLobby,
	setReady,
};

function	setPlayerInLobby(amount, total) {
	const playerCount = document.getElementById('playerCount');

	playerCount.innerText = amount + "/" + total;
}

function setReady(id) {
	const player = document.getElementById(`${id}`);
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

function	addPlayer(id) {
	const list = document.getElementById('playerList');
	var item = document.getElementById('playerExample').cloneNode(true);

	item.id = `${id}`;
	item.style = 'display: block;';
	item.querySelector('div').textContent = id;

	if (item.textContent != '')
		list.appendChild(item);
}