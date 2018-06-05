const Command = require('./Command');
const CommandResponse = require('./CommandResponse');
const TwitchConnectorIO = require('../Connector/TwitchConnectorIO');

module.exports = class UsersCommand extends Command {
    constructor (logger) {
        super('mods', logger);
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

        const chatters = await commandExchange.connector.getChatters().catch(err => {
            this.logger.error(`failed to get chatters : ${err}`);
        });

        let response = '';
        if (chatters && chatters.moderators) {
            response = chatters.moderators.join('\n');
        } else {
            response = "La liste des modos n'est pas disponible.";
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
