[![Greenkeeper badge](https://badges.greenkeeper.io/vyrtualsynthese/nozomiBot.svg)](https://greenkeeper.io/) [![Build Status](https://travis-ci.org/vyrtualsynthese/nozomiBot.svg?branch=master)](https://travis-ci.org/vyrtualsynthese/nozomiBot) [![Coverage Status](https://coveralls.io/repos/github/vyrtualsynthese/nozomiBot/badge.svg?branch=master)](https://coveralls.io/github/vyrtualsynthese/nozomiBot?branch=master)

# NozomiBot

This is a project for a Twitch/Youtube/Discord bot. Despite other bots, this one focus on easy setup and ready to use.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

* Docker : https://docs.docker.com/install/
* Docker compose (for development only) : https://docs.docker.com/compose/install/
* Yarn : https://yarnpkg.com/lang/en/docs/install/

### Installing

* Go to the project dir : `cd nozomiBot`
* Copy `.env.dist` to `.env` : `cp .env.dist .env`
* Configure `.env` : `vim .env`
* Set the rights to `var` (`1000` is the user `node` in the node container) : `setfacl -dR -m u:$(id -u):rwX -m u:1000:rwX var`
* Install the dependencies : `docker run -it --rm -u $(id -u):$(id -g) -v "$PWD":/app -w /app node:8-alpine yarn install`
* Launch Docker containers :
    * development env : `docker-compose -f docker-compose.dev.yml up -d`
    * production env : `docker stack deploy -c docker-compose.yml <name>`
* Use `docker container attach <containerid>` to put commands from the console. [See the official documentation](https://docs.docker.com/engine/reference/commandline/attach/#parent-command).

### Run Tests
You will need nyc installed globally to check code coverage
* `$ yarn global add nyc`
To run the linter
* `$ docker-compose exec node yarn lint`
To run tests
* `$ docker-compose exec node yarn test`
To send code coverage report to coveralls service.
* `$ docker-compose exec node yarn coveralls`

## Built With

* [Nodejs](https://nodejs.org/en/)

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Valentin RONTEIX** - *Initial work, Product Owner* - [vyrtualsynthese](https://github.com/vyrtualsynthese)
* **Thomas TALBOT** - **Senior Dev** - [Ioni](https://github.com/Ioni14)

See also the list of [contributors](https://github.com/vyrtualsynthese/nozomiBot/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* Hat tip to anyone whose code was used
* Inspiration
* etc
