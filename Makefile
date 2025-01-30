DOCKER_COMPOSE=docker compose -f backend/docker-compose.yml

ifeq ($(DETACH), 1)
DOCKER_COMPOSE += -d
endif

start:
	$(DOCKER_COMPOSE) up
.PHONY: start

build:
	$(DOCKER_COMPOSE) up --build
.PHONY: build

ps:
	$(DOCKER_COMPOSE) ps

stop:
	$(DOCKER_COMPOSE) down
.PHONY: stop

clean:
	docker system prune --volumes -f
.PHONY: clean

fclean: clean
	docker system prune -a -f
	$(DOCKER_COMPOSE) down --volumes --remove-orphans
	$(DOCKER_COMPOSE) down --rmi all
.PHONY: fclean

re: clean build
.PHONY: re
