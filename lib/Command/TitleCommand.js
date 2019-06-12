const Command = require('./Command');
const CommandResponse = require('./CommandResponse');
const TwitchConnectorIO = require('../Connector/TwitchConnectorIO');

module.exports = class TitleCommand extends Command {
    constructor (logger, twitchAPIHandler) {
        super('title', logger);
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
        if (streamInfo) {
            if (streamInfo.type !== 'live') {
                response = "Le stream n'est pas allumé.";
            } else {
                response = streamInfo.title;
                // add the game name
                if (streamInfo.game_id) {
                    const gameInfo = await this.twitchAPIHandler.getGameInfo(streamInfo.game_id).catch(err => {
                        this.logger.error(`failed to get game info : ${err}`);
                    });
                    if (gameInfo) {
                        response += ` sur ${gameInfo.name}`;
                    }
                }
            }
        } else {
            response = "Il n'y a pas de stream ou il vient d'être allumé.";
        }

        return new CommandResponse(
            response,
            commandExchange.sourceType,
            commandExchange.recipient,
            commandExchange.context
        );
    }
};
