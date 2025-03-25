DOCKER_COMPOSE=docker compose -f docker-compose.yml

ifeq ($(DETACH), 1)
DOCKER_COMPOSE += -d
endif

start: all_secrets .env | backend/services/nginx/certs/
	@echo "Starting the project..."
	@$(DOCKER_COMPOSE) up
.PHONY: start

build: all_secrets .env | backend/services/nginx/certs/
	@echo "Building the project..."
	@$(DOCKER_COMPOSE) up --build
.PHONY: build

backend/services/nginx/certs/:
	@mkdir -p backend/services/nginx/certs/

secrets:
	@mkdir -p secrets

secrets/django_secret_key: | secrets
	@echo "Generating Django secret key..."
	@openssl rand -base64 64 > secrets/django_secret_key

secrets/django_superuser.env: | secrets
	@echo "Generating Django default superuser credentials..."
	@echo "Changing the default superuser credentials is highly recommended."
	@echo "DJANGO_SUPERUSER_USERNAME=admin" > secrets/django_superuser.env
	@echo "DJANGO_SUPERUSER_EMAIL=admin@email.com" >> secrets/django_superuser.env
	@echo "DJANGO_SUPERUSER_PASSWORD=admin" >> secrets/django_superuser.env

secrets/postgres_password.env: | secrets
	@echo "Generating Postgres password..."
	@openssl rand -base64 32 | tr -d '\n' > secrets/postgres_password.env

all_secrets: secrets/django_secret_key secrets/django_superuser.env secrets/postgres_password.env
.PHONY: all_secrets

.env:
	@echo "Creating .env file with default values..."
	@echo "Change the default values in the .env file to suit your needs."
	@echo "POSTGRES_DB=db_name" > .env
	@echo "POSTGRES_USER=postgres_user" >> .env
	@echo "POSTGRES_PASSWORD_FILE=/run/secrets/postgres_password" >> .env
	@echo "POSTGRES_PORT=5432" >> .env

ps:
	@$(DOCKER_COMPOSE) ps
.PHONY: ps

stop:
	@echo "Stopping the project..."
	@$(DOCKER_COMPOSE) down
.PHONY: stop

clean: stop
	@docker system prune --volumes -f
	@rm -rf ./backend/services/django/media/*/*_*.*
	@rm -rf ./backend/services/nginx/certs/*
	@rm -rf ./web3_share/*
.PHONY: clean

fclean: clean
	@docker system prune -a -f
	@$(DOCKER_COMPOSE) down --rmi all --volumes --remove-orphans
.PHONY: fclean

re: fclean build
.PHONY: re
