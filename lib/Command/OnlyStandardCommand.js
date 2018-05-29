const Command = require('./Command');
const CommandResponse = require('./CommandResponse');
const StandardConnectorIO = require('../Connector/StandardConnectorIO');

module.exports = class OnlyStandardCommand extends Command {
    constructor (logger) {
        super('stdonly', logger);
    }

    usage () {
        return `${this.name} <message to display>`;
    }

    validate (commandExchange) {
        return commandExchange.args._.length > 0;
    }

    getAvailableConnectors () {
        return [StandardConnectorIO];
    }

    handle (commandExchange) {
        const message = commandExchange.args._.join(' ');
        this.logger.info(`received : ${message}`);

        commandExchange.connector.write(
            new CommandResponse(
                message,
                commandExchange.sourceType,
                commandExchange.recipient,
                commandExchange.context
            )
        );
    }
};
