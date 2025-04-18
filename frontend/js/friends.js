import { showErrorMessage, removeErrorMessage } from "./error_handling.js"
import { authenticatedFetch } from './authentication.js';
import { getCookie } from './utils.js';
import { LoadDataFromBackend } from "./profile.js";

const userDetailURL = `https://localhost/api/player/${getCookie('user_id')}/`;

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

class Player {
	constructor(id, username) {
		this.id = id;
		this.username = username;
	}

	createElement() {
		const playerElement = document.createElement('il');
		const usernameSpan = document.createElement('span');

		playerElement.classList.add('possible-friend-container');
		usernameSpan.classList.add('friend-name');
		usernameSpan.textContent = this.username;
		playerElement.appendChild(usernameSpan);
		return playerElement;
	}

	createRequestElement() {
		const playerElement = this.createElement();
		const requestButton = document.createElement('button');

		requestButton.classList.add('request-button', 'button');
		requestButton.textContent = 'Send Request';
		requestButton.addEventListener('click', () => {
			this.sendRequest();
			playerElement.remove();
		});

		playerElement.appendChild(requestButton);
		return playerElement;
	}

	sendRequest() {
		sendRequest(this.id);
	}

	createFriendElement() {
		const playerElement = this.createElement();
		const unfriendButton = document.createElement('button');

		unfriendButton.classList.add('unfriend-button', 'btn', 'btn-danger', 'unfriend-button');
		unfriendButton.textContent = 'Unfriend';
		unfriendButton.addEventListener('click', () => {
			this.unfriend();
			playerElement.remove();
		});
		playerElement.appendChild(unfriendButton);
		return playerElement;
	}

	unfriend() {
		unfriend(this.id);
	}
}

async function renderFriendList(data) {
	const friendsListElement = document.getElementById('friendsList');

	if (!friendsListElement)
		return;
	friendsListElement.innerHTML = '';
	if (!data || !data.friends)
		return;
	data.friends.forEach(async (friend) => {
		LoadDataFromBackend(`https://localhost/api/player/${friend}/`, (friendData) => {
			const friendElement = new Player(friendData.id, friendData.username).createFriendElement();
			if (!friendsListElement)
				return;
			friendsListElement.appendChild(friendElement);
		});
	});
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

async function findUsername(username, inputUsername) {
	const UserData = await LoadDataFromBackend(userDetailURL);
	const parentElement = document.getElementById('addFriendsList');

	LoadDataFromBackend(`https://localhost/api/player/list?username=${username}`, (results) => {
		if (!UserData) {
			return;
		}
		console.table(UserData);
		if (!results.length) {
			showErrorMessage(inputUsername, "Username doesn't match any user");
			return;
		}
		parentElement.innerHTML = '';
		console.table(results);
		results.forEach((result) => {
			if (result.id === UserData.id
				|| UserData.friends.includes(result.id)
				|| UserData.friend_requests.includes(result.id)) {
				return;
			}
			const player = new Player(result.id, result.username);
			const playerElement = player.createRequestElement();
			if (!parentElement) {
				return;
			}
			parentElement.appendChild(playerElement);
		});
	});
}

document.addEventListener('DOMContentLoaded', () => {
	const friendsTabElement = document.getElementById('friends-tab');
	const requestsTabElement = document.getElementById('requests-tab');
	const searchFriendButton = document.getElementById('searchFriendButton');
	const friendsTrigger = document.getElementById('friendsTrigger');
	const loadFriendList = () => LoadDataFromBackend(userDetailURL, renderFriendList);
	const loadFriendRequests = () => LoadDataFromBackend(userDetailURL, renderFriendRequests);

	friendsTrigger.addEventListener('click', () => {
		const activeTab = document.querySelector('#friendsTab .nav-link.active');

		if (!activeTab) return;
		switch (activeTab.id) {
			case 'friends-tab':
				loadFriendList(); // Call your function to load/display the friends
				break;
			case 'requests-tab':
				loadFriendRequests(); // Call your function to load/display friend requests
				break;
			default:
				console.log('No action defined for this tab.');
		}
	});
	searchFriendButton.addEventListener('click', handleAddFriendFormSubmit);
	friendsTabElement.addEventListener('click', loadFriendList);
	requestsTabElement.addEventListener('click', loadFriendRequests);
});

function handleAddFriendFormSubmit(event) {
	const inputUsername = document.getElementById('newFriendName');
	const username = inputUsername.value.trim();

	event.preventDefault();
	removeErrorMessage(inputUsername);
	if (username) {
		findUsername(username, inputUsername);
	} else {
		showErrorMessage(inputUsername, 'Please enter a username');
	}
}
