DOCKER_COMPOSE=docker compose -f docker-compose.yml

ifeq ($(DETACH), 1)
DOCKER_COMPOSE += -d
endif

start: | backend/services/nginx/certs/
	@echo "Starting the project..."
	@$(DOCKER_COMPOSE) up
.PHONY: start

build: | backend/services/nginx/certs/
	@echo "Building the project..."
	@$(DOCKER_COMPOSE) up --build
.PHONY: build

backend/services/nginx/certs/:
	@mkdir -p backend/services/nginx/certs/

ps:
	@$(DOCKER_COMPOSE) ps

stop:
	@echo "Stopping the project..."
	@$(DOCKER_COMPOSE) down
.PHONY: stop

clean:
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
