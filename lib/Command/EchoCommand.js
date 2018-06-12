const Command = require('./Command');
const CommandResponse = require('./CommandResponse');

module.exports = class EchoCommand extends Command {
    constructor (logger) {
        super('echo', logger);
    }

    usage () {
        return `${this.name} <message to display>`;
    }

    validate (commandExchange) {
        return commandExchange.args._.length > 0;
    }

    handle (commandExchange) {
        const message = commandExchange.args._.join(' ');
        this.logger.info(`received : ${message}`);

        return new CommandResponse(
            message,
            commandExchange.sourceType,
            commandExchange.recipient,
            commandExchange.context
        );
    }
};
