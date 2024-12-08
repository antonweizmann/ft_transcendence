function homePage(mainContent)
{
    mainContent.innerHTML = `
        <h1>Welcome to Pong Master</h1>
        <p>Get ready for an exciting game of Pong!</p>
    `;
}

function profilePage(mainContent)
{
    mainContent.innerHTML = `
        <h1>Welcome to your Profile</h1>
        <p>Lets introduce ourselfes!</p>
    `;
}


function playPage(mainContent)
{
    mainContent.innerHTML =`<div class="row h-100">
		<!-- Sidebar for game controls and profile -->
		<div class="col-md-3 bg-secondary p-3">
			<h2>Pong Game</h2>
			<div class="game-controls">
				<h3>Game Setup</h3>
				<!-- Placeholders for game configuration -->
				<div class="mb-3">
					<label class="form-label">Player Mode</label>
					<select class="form-select">
						<option>Local Multiplayer</option>
						<option>vs AI</option>
					</select>
				</div>
				<div class="mb-3">
					<label class="form-label">Difficulty</label>
					<select class="form-select">
						<option>Easy</option>
						<option>Medium</option>
						<option>Hard</option>
					</select>
				</div>
				<button class="btn btn-primary w-100">Start Game</button>
			</div>
		</div>

		<!-- Main game area -->
		<div class="col-md-9 d-flex justify-content-center align-items-center">
			<div class="game-board bg-dark border border-light" style="width: 800px; height: 400px; position: relative;">
				<!-- Game will be rendered here -->
				<div class="paddle left-paddle" style="position: absolute; left: 20px; top: 50%; transform: translateY(-50%); width: 15px; height: 100px; background-color: white;"></div>
				<div class="paddle right-paddle" style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%); width: 15px; height: 100px; background-color: white;"></div>
				<div class="ball" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px; background-color: white; border-radius: 50%;"></div>
			</div>
		</div>
	</div>`;

}

function tournamentsPage(mainContent)
{
    mainContent.innerHTML = `
        <h1>Welcome to your tournaments</h1>
        <p>Lets introduce ourselfes!</p>
    `;
}
function friendsPage(mainContent)
{
    mainContent.innerHTML = `
        <h1>Welcome to your friends</h1>
        <p>Lets introduce ourselfes!</p>
    `;
}
function loginPage(mainContent)
{
    mainContent.innerHTML = `
        <h1>Welcome to your login</h1>
        <p>Lets introduce ourselfes!</p>
    `;
}
function signupPage(mainContent)
{
    mainContent.innerHTML = `
        <h1>Welcome to your signup</h1>
        <p>Lets introduce ourselfes!</p>
    `;
}

function loadMainContent(page)
{
	const mainContent = document.getElementById('main-content');

	switch (page)
	{
		case 'home':
			homePage(mainContent);
			break;
		case 'profile':
			profilePage(mainContent);
			break;
		case 'play':
			playPage(mainContent);
			break;
		case 'tournaments':
			tournamentsPage(mainContent);
			break;
		case 'friends':
			friendsPage(mainContent);
			break;
		case 'login':
			loginPage(mainContent);
			break;
		case 'signup':
			signupPage(mainContent);
			break;
	}
}
