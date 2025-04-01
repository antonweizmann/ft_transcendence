// List Friends
async function friendList() {
	const response = await authenticatedFetch('https://localhost/api/player/' + localStorage.getItem("user_id"));
	const playerData = await response.json();
	const friendsListElement = document.getElementById('friendsList');

	if (friendsListElement) {
		console.log(JSON.stringify(playerData, null, 2));
		friendsListElement.innerHTML = '';

		playerData.friends.forEach((friend) => {
			const friendListItem = document.createElement('li');
			friendListItem.textContent = friend.username;
			friendsListElement.appendChild(friendListItem);
			
		});
	}
	else {
		console.error('Element with ID "friendsList" not found.');
	}
	
}

// List Friend Requests
async function friendRequests() {
	const response = await authenticatedFetch('https://localhost/api/player/' + localStorage.getItem("user_id"));
	const playerData = await response.json();
	const requestsListElement = document.getElementById('requestsList');

	if (requestsListElement) {
		console.log(JSON.stringify(playerData, null, 2));
		requestsListElement.innerHTML = '';

		playerData.friend_requests.forEach((request) => {
			const friendListItem = document.createElement('li');
			friendListItem.textContent = request.username;
			requestsListElement.appendChild(friendListItem);
			
		});
	}
	else {
		console.error('Element with ID "friend-requests-list" not found.');
	}
	
}

document.addEventListener('DOMContentLoaded', function() {
	const friendsTabElement = document.getElementById('friends-tab');
	const requestsTabElement = document.getElementById('requests-tab');

	friendsTabElement.addEventListener('click', friendList);
	requestsTabElement.addEventListener('click', friendRequests);
});