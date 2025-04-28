# Pong Masters

Welcome to Pong Masters – a full-stack web application project inspired by the classic Pong game, designed as part of the 42 curriculum. This project challenges you to build a real-time, multiplayer online Pong platform with robust user management, security, and modern web development practices.

## Project Overview

Pong Masters is an online platform where users can:
1. Play real-time Pong matches and tournaments against other players.
1. Compete in organized tournaments with matchmaking.
1.  Manage user profiles, friends, and chat with others.
1. Experience a secure and responsive single-page application.

The project emphasizes modularity, security, and extensibility, providing a foundation for further enhancements.

## Features

- Real-Time Pong Gameplay: Play classic Pong in your browser, either head-to-head or in tournaments.
- Tournaments & Matchmaking: Organize and participate in tournaments with automated matchmaking and clear player progression.
- User Management: Register, authenticate (including optional two-factor authentication), edit profiles, and manage friends.
- Live Chat: Communicate with other players in real time.
- Security: Passwords are securely hashed, HTTPS is enforced, and protection against common vulnerabilities (SQL injection, XSS) is implemented.
- Single-Page Application: Seamless navigation with browser history support.
- Dockerized Deployment: Launch the entire stack with a single command for easy setup and portability

## Technology Stack
	
| Category         | Technology                                             |
|------------------|--------------------------------------------------------|
| Backend          | Django                                                 |
| Frontend         | Javascript & Bootstrap |
| Database         | PostgreSQL |
| Server-side Cache | Redis |
| Containerization | Docker |
| Authentication   | JWT |
| Web Server       | Nginx |
| Blockchain | Solidity & Etherium |

## Quickstart

1. Clone the repository:

```bash
git clone https://github.com/JorFik/ft_transcendence.git
```
1. Go to the new repository in your machine
```bash
cd ft_transcendence
```
1. Finally create and run the project
```bash
make
```
> This will generated all necessary files to create a basic Pong Master experience, for a more in depth experience, please follow the instructions below.

## Configure Admin credentials:

> For the next step, it is assumed that you cloned the repository and navigated to it.

1. Generate a template of all secrets
	```bash
	make all_secrets
	```
	> In order to be able to acccess the [admin dashboard](https://localhost/admin "Go to the admin dashboard"), you will need to modify the generated secret files.

2. Navigate with your favorite IDE, cli tool, or any text editor to secrets/django_superuser.env, you should find a file like this:
   
```env
DJANGO_SUPERUSER_USERNAME=
DJANGO_SUPERUSER_EMAIL=
DJANGO_SUPERUSER_PASSWORD=
```

3. Fill the empty credentials
```env
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@admin.de
DJANGO_SUPERUSER_PASSWORD=V3ry_s3cUr3_p4ssw0rd!
```
> Please do not use those credentials, they are meant to be just an example.

> **⚠️ WARNING** Never commit sensitive credentials to version control.

1. The app is ready to run.

```bash
make
```

1. You should start seeing logs from the containers appear, your Pong Masters is now running, enjoy it ;]

## Access the application:

Simply open your browser of choice and navigate to the [homepage](https://localhost/ "Go to Pong Masters home page") and explore.

> There is more content after you login, you can do that with your admin credentials or [sign up](https://localhost/signup "Create a new account") a new account.

## Stopping the application:

To stop the app at any point you can  ```CTR+C``` in the terminal with the logs, or
```bash
make stop
```
in another terminal.

## License

This project is licensed under the GNU General Public License v2.0. See the [LICENSE](../main/LICENSE "GNL 2") file for details.

## Credits

Project inspired by the 42 curriculum and built by [JFikents](https://github.com/JorFik), [AWeizman](https://github.com/antonweizmann), [PAdam](https://github.com/myryk31415) and [AJakob](https://github.com/42ajakob)
Special thanks to the 42 community for guidance and support.

## Contact

For questions or support, open an issue on GitHub or contact the maintainers directly.

Enjoy playing Pong – and happy hacking!
