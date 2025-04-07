export function showErrorMessage(input, message)
{
	const errorMessage = document.createElement('div');
	errorMessage.classList.add('invalid-feedback', 'd-block');
	if (Array.isArray(message)) {
		errorMessage.innerHTML = message.join('<br>'); // Join messages with line breaks
	} else {
		errorMessage.textContent = message; // Single message
	}
	input.parentNode.appendChild(errorMessage);
}

export function removeErrorMessage(input)
{
	input.classList.remove('is-invalid');
	const existingErrors = input.parentNode.querySelectorAll('.invalid-feedback');
	existingErrors.forEach(error => error.remove());
}

export function showErrors(fields, errors)
{
	console.log("showing errors:", errors);
	fields.forEach(({ field }) => removeErrorMessage(field));

	fields.forEach(({ key, field }) => {
		if (errors[key]) {
			field.classList.add('is-invalid');
			showErrorMessage(field, errors[key]);
		}
	});
}

export function showErrorInAllFields(fields, error)
{
	fields.forEach(({ field }) => {
		field.classList.add('is-invalid');
		showErrorMessage(field, error);
	});
}