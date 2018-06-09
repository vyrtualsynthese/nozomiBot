const Command = require('./Command');
const CommandResponse = require('./CommandResponse');
const TwitchConnectorIO = require('../Connector/TwitchConnectorIO');

module.exports = class UsersCommand extends Command {
    constructor (logger, twitchAPIHandler) {
        super('users', logger);
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

        const chatters = await this.twitchAPIHandler.getChatters().catch(err => {
            this.logger.error(`failed to get chatters : ${err}`);
        });

        let response = '';
        if (chatters && chatters.viewers) {
            // TODO : limit number of viewers ?
            response = chatters.viewers.join('\n');
        } else {
            response = "La liste des viewers n'est pas disponible.";
        }

        commandExchange.connector.write(
            new CommandResponse(
                response,
                'whisper',
                commandExchange.context.userstate.username,
                commandExchange.context
            )
        );
    }
};
