import { authenticatedFetch } from './authentication.js';

console.log("Profile JS pre-loaded");
window.initProfile = initProfile;

let current_user = null;

export function initProfile() {
	if (document.readyState === 'complete') {
		console.log('Document already complete, initializing now');
		loadProfile();
	} else {
		console.log('Document not ready, adding listener');
		document.addEventListener('DOMContentLoaded', loadProfile);
	}
}

function loadProfile() {
	console.log("Profile JS loaded");
	const userId = localStorage.getItem('user_id');
	const username = localStorage.getItem('username');

	LoadDataFromBackend(`/api/player/${userId}/`, setProfileData);
	LoadDataFromBackend(`/api/pong/match/list/?username=${username}`, setStats);
}

function setProfileData(data) {
	const profile_pic = document.getElementById('profile_pic');
	const username = document.getElementById('username');
	const profile_container = document.getElementById('profile_container');

	username.textContent = data.username;
	current_user = data.username;
	if (data.profile_picture)
		profile_pic.src = "https://localhost" + data.profile_picture;
	profile_container.classList.remove('loading');
}

async function LoadDataFromBackend(url, setter) {
	try {
		const response = await authenticatedFetch(url, { method: 'GET' });

		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const data = await response.json();
		if (setter)
			setter(data);
		return data;
	}
	catch (error) {
		console.error('Error fetching data:', error);
	}
}

function setStats(data) {
	const stats_container = document.getElementById('stats_container');
	const games_played = document.getElementById('games_played');
	const games_won = document.getElementById('games_won');
	const games_lost = document.getElementById('games_lost');
	const win_rate = document.getElementById('win_rate');
	const user = current_user || localStorage.getItem('username');

	if (data.length === 0) {
		stats_container.innerHTML = "<p>No matches played yet.</p>";
		stats_container.classList.remove('loading');
		return ;
	}
	data.forEach(match => {
		const winner = getPongWinner(match.scores);
		if (winner[0] === user) {
			games_won.textContent = parseInt(games_won.textContent) + 1;
		}
		else if (winner[0] !== "Draw") {
			games_lost.textContent = parseInt(games_lost.textContent) + 1;
		}
		games_played.textContent = parseInt(games_played.textContent) + 1;
	});
	win_rate.textContent = getPongWinRate(
		parseInt(games_won.textContent),
		parseInt(games_played.textContent)
	);
	stats_container.classList.remove('loading');
}

function getPongWinner(scores) {
	const	[player1, player2] = Object.entries(scores);
	const	[player1_id, player1_score] = player1;
	const	[player2_id, player2_score] = player2

	if (player1_score === player2_score)
		return ["Draw", player1_score];
	if (player1_score < player2_score)
		return [player2_id, player2_score];
	return [player1_id, player1_score];
}

function getPongWinRate(wins, total) {
	if (total === 0)
		return 0;
	return `${((wins / total) * 100).toFixed(2)}%`;
}
