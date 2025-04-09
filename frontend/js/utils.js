import { LoadDataFromBackend } from "./profile";

export {
	deactivateButton,
	showToast,
	getCookie,
	fetchUserData,
}

function deactivateButton(id) {
	const button = document.getElementById(id);
	const replaceButton = button.cloneNode(true);

	if (button) {
		button.parentNode.replaceChild(replaceButton, button);
		replaceButton.classList.add('button-pressed');
		replaceButton.disabled = true;
		replaceButton.classList.remove('button-hover');
	}
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

function getCookie(name) {
	const cookies = document.cookie.split(';');
	for (let cookie of cookies) {
		cookie = cookie.trim();
		if (cookie.startsWith(`${name}=`)) {
			return cookie.substring(name.length + 1);
		}
	}
	return null;
}

async function fetchUserData(user_id) {
	const userId = user_id || getCookie("user_id");
	const url = `https://localhost/api/player/${userId}/`;

	return await LoadDataFromBackend(url);
}