const Command = require('./Command');
const CommandResponse = require('./CommandResponse');
const TwitchConnectorIO = require('../Connector/TwitchConnectorIO');

module.exports = class TitleCommand extends Command {
    constructor (logger) {
        super('title', logger);
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

        const streamInfo = await commandExchange.connector.getStreamInfo(process.env.TWITCH_CHANNEL_ID).catch(err => {
            this.logger.error(`failed to get stream info : ${err}`);
        });

        let response = '';
        if (streamInfo) {
            if (streamInfo.type !== 'live') {
                response = 'The stream is not live.';
            } else {
                response = streamInfo.title;
                // add the game name
                if (streamInfo.game_id) {
                    const gameInfo = await commandExchange.connector.getGameInfo(streamInfo.game_id).catch(err => {
                        this.logger.error(`failed to get game info : ${err}`);
                    });
                    if (gameInfo) {
                        response += ` sur ${gameInfo.name}`;
                    }
                }
            }
        } else {
            response = 'There are no streams.';
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
