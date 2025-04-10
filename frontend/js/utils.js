export {
	deactivateButton,
	showToast,
	getCookie,
	reactivateButton
}

function reactivateButton(id, clickHandler) {
	const button = document.getElementById(id);

	if (button) {
		button.classList.remove('button-pressed');
		button.disabled = false;
		button.classList.add('button-hover');
		button.addEventListener('click', clickHandler);
	}
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
