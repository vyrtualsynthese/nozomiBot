export $UID = $(id -u)
export $GID = $(id -g)

install:
	docker-compose run --rm --no-deps node bash -ci 'yarn install'
