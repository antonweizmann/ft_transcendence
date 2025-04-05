async function friendList() {
	try {
		const response = await authenticatedFetch('https://localhost/api/player/' + localStorage.getItem("user_id"));
		const data = await response.json();
		const friendsListElement = document.getElementById('friendsList');

		if (friendsListElement) {
			friendsListElement.innerHTML = '';

			if (data.friends) {
				data.friends.forEach((friend) => {
					const friendListItem = document.createElement('li');
					const friendHTML = `
						<div>
						<span>${friend}</span>
						<button id="unfriend-button" class="btn btn-danger unfriend-button" data-user-id="${friend}">Unfriend</button>
						</div>
					`;
					friendListItem.innerHTML = friendHTML;
					friendsListElement.appendChild(friendListItem);

					const unfriendButton = friendListItem.querySelector('#unfriend-button');
					unfriendButton.addEventListener('click', () => {
						unfriend(friend);
					});
				});
			} else
				console.log('No friends found');
		} else
			console.error('Element with ID "friendsList" not found.');
	} catch (error) {
		console.error('Error fetching friend list:', error);
	}
}

async function friendRequests() {
	try {
		const response = await authenticatedFetch('https://localhost/api/player/' + localStorage.getItem("user_id"));
		const data = await response.json();
		const requestsListElement = document.getElementById('requestsList');

		if (requestsListElement) {
			requestsListElement.innerHTML = '';

			if (data.friend_requests_received) {
				data.friend_requests_received.forEach((request) => {
					const requestListItem = document.createElement('li');
					requestListItem.classList.add('list-group-item');

					const requestHTML = `
						<div>
						<span>${request.username}</span>
						<button class="btn btn-success accept-button" data-user-id="${request.id}">Accept</button>
						<button class="btn btn-danger decline-button" data-user-id="${request.id}">Decline</button>
						</div>
					`;
					requestListItem.innerHTML = requestHTML;

					requestsListElement.appendChild(requestListItem);
				});
			} else
				console.log('No friend requests found');
		} else
			console.error('Element with ID "requestsList" not found.');
	} catch (error) {
		console.error('Error fetching friend requests:', error);
	}
}

async function addFriend(username) {
	if (!username) {
		console.error('Username is required');
		return false;
	}

	fetch(`https://localhost/api/player/list?username=${username}`, { method: 'GET' })
	.then(response => response.json())
	.then(data => {
		if (data.length > 0 && data[0]) {
			const playerHTML = `
				<div>
				<span>${data[0].username}</span>
				<button id="sendRequestButton" data-player-id="${data[0].id}">Send Request</button>
				</div>
			`;

			const playerElement = document.createElement('div');
			playerElement.innerHTML = playerHTML;
			const parentElement = document.getElementById('add-friends');
			parentElement.appendChild(playerElement);

			const sendRequestButton = playerElement.querySelector('#sendRequestButton');
			sendRequestButton.addEventListener('click', () => {
				const user_id = sendRequestButton.dataset.playerId;
				sendRequest(user_id);
			});
		} else
			console.log('Player not found');		
	})
	.catch(error => {
		console.error('Error adding friend:', error);
	});
}

async function sendRequest(user_id) {
	try {
		await authenticatedFetch(`https://localhost/api/player/send_request/${user_id}/`, {
			method: 'POST',
		});
		console.log('Request send');
	} catch (error) {
		console.error('Error sending request:', error);
	}
}

async function acceptRequest(user_id) {
	try {
		await authenticatedFetch(`https://localhost/api/player/accept_request/${user_id}/`, {
			method: 'POST',
		});
		console.log('Request accepted');
	} catch (error) {
		console.error('Error accepting request:', error);
	}
}

async function declineRequest(user_id) {
	try {
		await authenticatedFetch(`https://localhost/api/player/reject_request/${user_id}/`, {
			method: 'POST',
		});
		console.log('Request declined');
	} catch (error) {
		console.error('Error declining request:', error);
	}
}

async function unfriend(user_id) {
	try {
		const response = await authenticatedFetch(`https://localhost/api/player/unfriend/${user_id}/`, {
			method: 'POST'
		});
		console.log(response);
		console.log('Friend removed');
	} catch (error) {
		console.error('Error removing friend:', error);
	}
}

document.addEventListener('DOMContentLoaded', function() {
	const friendsTabElement = document.getElementById('friends-tab');
	const requestsTabElement = document.getElementById('requests-tab');
	const addFriendForm = document.getElementById('addFriendForm');
	const requestsListElement = document.getElementById('requestsList');

	addFriendForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const username = document.getElementById('newFriendName').value.trim();
		if (username)
			addFriend(username);
		else
			document.getElementById('addFriendFeedback').innerHTML = 'Please enter a username';
	});

	requestsListElement.addEventListener('click', (event) => {
		if (event.target.classList.contains('accept-button')) {
			const user_id = event.target.dataset.user_id;
			acceptRequest(user_id);
		} else if (event.target.classList.contains('decline-button')) {
			const user_id = event.target.dataset.user_id;
			declineRequest(user_id);
		}
	});

	friendsTabElement.addEventListener('click', friendList);
	requestsTabElement.addEventListener('click', friendRequests);
});