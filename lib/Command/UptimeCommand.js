const Command = require('./Command');
const CommandResponse = require('./CommandResponse');
const TwitchConnectorIO = require('../Connector/TwitchConnectorIO');
const moment = require('moment');

module.exports = class UptimeCommand extends Command {
    constructor (logger, twitchAPIHandler) {
        super('uptime', logger);
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
        if (streamInfo && streamInfo.started_at) {
            const minutes = moment(new Date()).diff(streamInfo.started_at, 'minutes');
            response = `${minutes} minutes`;
        } else {
            response = "L'uptime n'est pas disponible.";
        }

        return new CommandResponse(
            response,
            commandExchange.sourceType,
            commandExchange.recipient,
            commandExchange.context
        );
    }
};
