ROOT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
UID:=$(shell id -u)
GID:=$(shell id -g)

cli:
	docker-compose exec node sh
logs:
	docker-compose logs -f node

up:
	docker-compose up -d $(c)
down:
	docker-compose down $(c)
down-volumes:
	docker-compose down -v $(c)
start:
	docker-compose start $(c)
stop:
	docker-compose stop $(c)
restart:
	make stop && make start
exec:
	docker-compose exec $(c)

tests:
	docker-compose exec node yarn test

yarn:
	docker run --rm -it -u $(UID):$(GID) --env-file $(ROOT_DIR)/.env -v /etc/passwd:/etc/passwd -v $(ROOT_DIR):/app -w /app --init node:8-alpine yarn $(c)
yu:
	make yarn c="upgrade $(c)"
ya:
	make yarn c="add $(c) --dev"
yi:
	make yarn c="install $(c)"

install:
	cp .env.dist .env
	setfacl -dR -m u:$(UID):rwX -m u:1000:rwX var
	setfacl -R -m u:$(UID):rwX -m u:1000:rwX var
	make yi
