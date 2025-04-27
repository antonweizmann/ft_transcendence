import { showErrorMessage, removeErrorMessage } from "./error_handling.js"
import { authenticatedFetch } from './authentication.js';
import { getCookie } from './utils.js';
import { LoadDataFromBackend } from "./profile.js";
import { changeLanguage } from "./translations.js";

async function sendRequest(user_id) {
	try {
		await authenticatedFetch(`/api/player/send_request/${user_id}/`, {
			method: 'POST',
		});
		console.log('Request send');
	} catch (error) {
		console.error('Error sending request:', error);
	}
}

async function acceptRequest(user_id) {
	try {
		await authenticatedFetch(`/api/player/accept_request/${user_id}/`, {
			method: 'POST',
		});
		console.log('Request accepted');
	} catch (error) {
		console.error('Error accepting request:', error);
	}
}

async function declineRequest(user_id) {
	try {
		await authenticatedFetch(`/api/player/reject_request/${user_id}/`, {
			method: 'POST',
		});
		console.log('Request declined');
	} catch (error) {
		console.error('Error declining request:', error);
	}
}

async function unfriend(user_id) {
	try {
		await authenticatedFetch(`/api/player/unfriend/${user_id}/`, {
			method: 'POST'
		});
		console.log('Friend removed');
	} catch (error) {
		console.error('Error removing friend:', error);
	}
}

class Player {
	constructor(id, username, online) {
		this.id = id;
		this.username = username;
		this.online = online;
	}

	#createBaseElement() {
		const playerElement = document.createElement('li');
		const usernameSpan = document.createElement('span');
		const statusDot = document.createElement('span');

		playerElement.classList.add('possible-friend-container');
		usernameSpan.classList.add('friend-name');
		usernameSpan.textContent = this.username;

		statusDot.classList.add('status-dot');
		statusDot.classList.add(this.online ? 'online' : 'offline');
		statusDot.title = this.online ? 'Online' : 'Offline';


		playerElement.appendChild(statusDot);
		playerElement.appendChild(usernameSpan);
		return playerElement;
	}

	createSendRequestElement() {
		const playerElement = this.#createBaseElement();
		const requestButton = document.createElement('button');

		requestButton.classList.add('request-button', 'button');
		requestButton.textContent = 'Send Request';
		requestButton.setAttribute('data-translate', 'sendRequest');
		requestButton.addEventListener('click', () => {
			sendRequest(this.id);
			playerElement.remove();
		});

		playerElement.appendChild(requestButton);
		return playerElement;
	}

	createFriendElement() {
		const playerElement = this.#createBaseElement();
		const unfriendButton = document.createElement('button');

		unfriendButton.classList.add('unfriend-button', 'btn', 'btn-danger', 'unfriend-button');
		unfriendButton.textContent = 'Unfriend';
		unfriendButton.setAttribute('data-translate', 'unfriend');
		unfriendButton.addEventListener('click', () => {
			unfriend(this.id);
			playerElement.remove();
		});
		playerElement.appendChild(unfriendButton);
		return playerElement;
	}

	createRequestActionElement() {
		const playerElement = this.#createBaseElement();
		const acceptButton = document.createElement('button');
		const declineButton = document.createElement('button');

		acceptButton.classList.add('btn', 'btn-success', 'accept-button', 'me-2');
		acceptButton.textContent = 'Accept';
		acceptButton.setAttribute('data-translate', 'accept');
		acceptButton.addEventListener('click', () => {
			acceptRequest(this.id);
			playerElement.remove();
		});

		declineButton.classList.add('btn', 'btn-danger', 'decline-button');
		declineButton.textContent = 'Decline';
		declineButton.setAttribute('data-translate', 'decline');
		declineButton.addEventListener('click', () => {
			declineRequest(this.id);
			playerElement.remove();
		});
		playerElement.appendChild(acceptButton);
		playerElement.appendChild(declineButton);
		return playerElement;
	}
}

async function renderFriendList(data) {
	const friendsListElement = document.getElementById('friendsList');

	if (!friendsListElement)
		return;
	friendsListElement.innerHTML = '';
	if (!data || !data.friends)
		return;
	const friendPromises = data.friends.map(async (friend) => {
		await LoadDataFromBackend(`/api/player/${friend}/`, (friendData) => {
			console.table(friendData);

		// Check if last_login is within 5 minutes
		const lastLoginTime = new Date(friendData.last_login);
		const now = new Date();
		const diffInMs = now - lastLoginTime;
		const diffInMinutes = diffInMs / 1000 / 60;

		const isOnline = diffInMinutes <= 5;

		// Pass online status to Player
		const friendElement = new Player(friendData.id, friendData.username, isOnline).createFriendElement();
			if (friendsListElement) {
				friendsListElement.appendChild(friendElement);
			}
		});
	});
	await Promise.all(friendPromises);
	changeLanguage();
}

function renderFriendRequests(data) {
	const requestsListElement = document.getElementById('requestsList');

	if (!requestsListElement)
		return;
	requestsListElement.innerHTML = '';
	if (!data.friend_requests_received)
		return;
	data.friend_requests_received.forEach((request) => {
		const requestListItem = new Player(request.id, request.username).createRequestActionElement();
		requestsListElement.appendChild(requestListItem);
	});
	changeLanguage();
}

async function findUsername(username, inputUsername) {
	const UserData = await LoadDataFromBackend(`/api/player/${getCookie('user_id')}/`);
	const parentElement = document.getElementById('addFriendsList');

	LoadDataFromBackend(`/api/player/list?username=${username}`, (results) => {
		if (!UserData)
			return;
		if (!results.length) {
			showErrorMessage(inputUsername, "Username doesn't match any user");
			return;
		}
		parentElement.innerHTML = '';
		results.forEach((result) => {
			if (result.id === UserData.id
				|| UserData.friends.includes(result.id)
				|| UserData.friend_requests.includes(result.id)) {
				return;
			}
			const player = new Player(result.id, result.username);
			const playerElement = player.createSendRequestElement();
			if (parentElement)
				parentElement.appendChild(playerElement);
		});
		changeLanguage();
	});
}

document.addEventListener('DOMContentLoaded', () => {
	const friendsTabElement = document.getElementById('friends-tab');
	const requestsTabElement = document.getElementById('requests-tab');
	const searchFriendButton = document.getElementById('searchFriendButton');
	const friendsTrigger = document.getElementById('friendsTrigger');
	const loadFriendList = () => LoadDataFromBackend(`/api/player/${getCookie('user_id')}/`, renderFriendList);
	const loadFriendRequests = () => LoadDataFromBackend(`/api/player/${getCookie('user_id')}/`, renderFriendRequests);

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
