const Command = require('./Command');
const CommandResponse = require('./CommandResponse');
const TwitchConnectorIO = require('../Connector/TwitchConnectorIO');
const moment = require('moment');

module.exports = class UptimeCommand extends Command {
    constructor (logger) {
        super('uptime', logger);
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
        if (streamInfo && streamInfo.started_at) {
            const milliseconds = moment(new Date()).valueOf() - moment(streamInfo.started_at).valueOf();
            response = `${Math.round(milliseconds / 1000 / 60)} minutes`;
        } else {
            response = "L'uptime n'est pas disponible.";
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
