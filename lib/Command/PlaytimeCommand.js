const Command = require('./Command');
const CommandResponse = require('./CommandResponse');
const TwitchConnectorIO = require('../Connector/TwitchConnectorIO');
const moment = require('moment');

module.exports = class PlaytimeCommand extends Command {
    constructor (logger, gameChangeRepo, twitchAPIHandler) {
        super('playtime', logger);
        this.gameChangeRepo = gameChangeRepo;
        this.twitchAPIHandler = twitchAPIHandler;
    }

    usage () {
        return `${this.name}`;
    }

    validate (commandExchange) {
        return commandExchange.args._.length === 0;
    }

    getAvailableConnectors () {
        return [TwitchConnectorIO];
    }

    async handle (commandExchange) {
        this.logger.info('received');

        const lastGameChange = await this.gameChangeRepo.findLast();

        let response = '';
        if (lastGameChange.gameId === null) {
            response = 'Aucun jeu en cours ou lancement trop récent.';
        } else {
            const elapsedMinutes = moment(new Date()).diff(lastGameChange.seeAt, 'minutes');

            const gameInfo = await this.twitchAPIHandler.getGameInfo(lastGameChange.gameId).catch(err => {
                this.logger.error(`failed to get game info : ${err}`);
            });

            if (!gameInfo) {
                response = `Joue depuis ${elapsedMinutes} minutes sur un jeu inconnu.`;
            } else {
                response = `Joue depuis ${elapsedMinutes} minutes sur ${gameInfo.name}.`;
            }
        }

        return new CommandResponse(
            response,
            commandExchange.sourceType,
            commandExchange.recipient,
            commandExchange.context
        );
    }
};
