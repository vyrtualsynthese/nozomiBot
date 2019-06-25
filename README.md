# NozomiBot

This is a project for a Twitch/Youtube/Discord bot. Despite other bots, this one focus on easy setup and ready to use.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

* [Docker](https://docs.docker.com/install/)
* [Docker Compose](https://docs.docker.com/compose/install/)

### Installing for Prod

* Just run : `docker-compose up -d`

### Installing in dev

* First run : `docker run --rm -it -v $PWD:/app -w /app -u $(id -u):$(id -g) node yarn`
* Then uncomment and edit docker-compose.override if needed
* Then run the app `docker-compose up -d`

## Built With

* [Nodejs](https://nodejs.org/en/)

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
