
function addPlayer() {
	const list = document.getElementById('player-list');
	const input = document.getElementById('add-player-name');

	var item = document.createElement('div');
	item.className = 'list-group-item';
	item.textContent = input.value;
	input.value = '';

	if (item.textContent != '')
		list.appendChild(item);
	return false;
}
