const Command = require('./Command');
const CommandResponse = require('./CommandResponse');
const TwitchConnectorIO = require('../Connector/TwitchConnectorIO');

module.exports = class GameCommand extends Command {
    constructor (logger, twitchAPIHandler) {
        super('game', logger);
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

        const streamInfo = await this.twitchAPIHandler.getStreamInfo(process.env.TWITCH_CHANNEL_ID).catch(err => {
            this.logger.error(`failed to get stream info : ${err}`);
        });

        let response = '';
        if (streamInfo && streamInfo.game_id) {
            const gameInfo = await this.twitchAPIHandler.getGameInfo(streamInfo.game_id).catch(err => {
                this.logger.error(`failed to get game info : ${err}`);
            });
            if (gameInfo) {
                response = gameInfo.name;
            } else {
                response = 'Jeu inconnu.';
            }
        } else {
            response = "Aucun jeu n'est lancé.";
        }

        commandExchange.connector.write(
            new CommandResponse(
                response,
                commandExchange.sourceType,
                commandExchange.recipient,
                commandExchange.context
            )
        );
    }
};
