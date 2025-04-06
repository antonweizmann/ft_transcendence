// import {showErrorMessage, removeErrorMessage} from "./form_validation.js"

function showErrorMessage(input, message)
{
	const errorMessage = document.createElement('div');
	errorMessage.classList.add('invalid-feedback', 'd-block');
	errorMessage.textContent = message;
	input.parentNode.appendChild(errorMessage);
}

function removeErrorMessage(input)
{
	input.classList.remove('is-invalid');
	const existingErrors = input.parentNode.querySelectorAll('.invalid-feedback');
	existingErrors.forEach(error => error.remove());
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
		console.log('Friend removed');
	} catch (error) {
		console.error('Error removing friend:', error);
	}
}

async function fetchFriendData() {
	try {
		const response = await authenticatedFetch(`https://localhost/api/player/${localStorage.getItem("user_id")}`);
		return await response.json();
	} catch (error) {
		console.error('Error fetching friend data:', error);
	}
}

async function renderFriendList(data) {
	const friendsListElement = document.getElementById('friendsList');
	if (!friendsListElement)
		return;

	friendsListElement.innerHTML = '';

	if (!data.friends)
		return;

	data.friends.forEach(async (friend) => {
		const friendData = await fetchFriendDetails(friend);
		if (!friendData)
			return;

		const friendListItem = document.createElement('li');
		friendListItem.innerHTML = `
			<div class="d-flex justify-content-between align-items-center">
				<span>${friendData.username}</span>
				<div class="d-flex justify-content-end">
					<button id="unfriend-button" class="btn btn-danger unfriend-button" data-user-id="${friend}">Unfriend</button>
				</div>
			</div>
		`;
		friendsListElement.appendChild(friendListItem);

		const unfriendButton = friendListItem.querySelector('#unfriend-button');
		unfriendButton.addEventListener('click', () => {
			unfriend(friend);
			friendListItem.remove();
		});
	});
}

async function fetchFriendDetails(friendId) {
	try {
		const response = await authenticatedFetch(`https://localhost/api/player/${friendId}`);
		return await response.json();
	} catch (error) {
		console.error('Error fetching friend details:', error);
	}
}

async function friendList() {
	const data = await fetchFriendData();
	if (!data)
		return;

	await renderFriendList(data);
}

async function renderFriendRequests(data) {
	const requestsListElement = document.getElementById('requestsList');
	if (!requestsListElement)
		return;

	requestsListElement.innerHTML = '';

	if (!data.friend_requests_received)
		return;

	data.friend_requests_received.forEach((request) => {
		const requestListItem = document.createElement('li');
		requestListItem.classList.add('list-group-item');

		const requestHTML = `
			<div class="d-flex justify-content-between align-items-center">
				<span>${request.username}</span>
				<div class="d-flex justify-content-end">
					<button class="btn btn-success accept-button me-2" data-user-id="${request.id}">Accept</button>
					<button class="btn btn-danger decline-button" data-user-id="${request.id}">Decline</button>
				</div>
			</div>
		`;
		requestListItem.innerHTML = requestHTML;

		requestsListElement.appendChild(requestListItem);

		const acceptButton = requestListItem.querySelector('.accept-button');
		const declineButton = requestListItem.querySelector('.decline-button');

		acceptButton.addEventListener('click', () => {
			acceptRequest(request.id);
			requestListItem.remove();
		});

		declineButton.addEventListener('click', () => {
			declineRequest(request.id);
			requestListItem.remove();
		});
	});
}

async function friendRequests() {
	try {
		const response = await authenticatedFetch(`https://localhost/api/player/${localStorage.getItem("user_id")}`);
		const data = await response.json();
		await renderFriendRequests(data);
	} catch (error) {
		console.error('Error fetching friend requests:', error);
	}
}

async function addFriend(username, inputUsername) {
	try {
		const response = await fetch(`https://localhost/api/player/list?username=${username}`, { method: 'GET' });
		const data = await response.json();

		if (!data.length || !data[0]) {
			inputUsername.classList.add('is-invalid');
			showErrorMessage(inputUsername, 'User does not exist');
			console.log('Player not found');
			return;
		}

		const playerHTML = `
			<div class="d-flex justify-content-between align-items-center mb-3 p-3 border border-purple rounded shadow-sm">
				<span class="fs-5 fw-semibold">${data[0].username}</span>
				<div class="d-flex">
					<button class="btn btn-purple btn-sm" id="sendRequestButton" data-player-id="${data[0].id}">Send Request</button>
				</div>
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
			playerElement.remove();
		});
	} catch (error) {
		console.error('Error adding friend:', error);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const friendsTabElement = document.getElementById('friends-tab');
	const requestsTabElement = document.getElementById('requests-tab');
	const addFriendForm = document.getElementById('addFriendForm');
	const friendsTrigger = document.getElementById('friendsTrigger');

	friendsTrigger.addEventListener('click', () => {
		const activeTab = document.querySelector('#friendsTab .nav-link.active');

		if (!activeTab) return;

		switch (activeTab.id) {
			case 'friends-tab':
				friendList(); // Call your function to load/display the friends
				break;
			case 'requests-tab':
				friendRequests(); // Call your function to load/display friend requests
				break;
			default:
				console.log('No action defined for this tab.');
		}
	});

	addFriendForm.addEventListener('submit', handleAddFriendFormSubmit);
	friendsTabElement.addEventListener('click', friendList);
	requestsTabElement.addEventListener('click', friendRequests);
});

function handleAddFriendFormSubmit(e) {
	e.preventDefault();
	const inputUsername = document.getElementById('newFriendName');
	removeErrorMessage(inputUsername);
	const username = inputUsername.value.trim();
	if (username) {
		addFriend(username, inputUsername);
	} else {
		document.getElementById('addFriendFeedback').innerHTML = 'Please enter a username';
	}
}
