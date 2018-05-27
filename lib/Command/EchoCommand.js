const Command = require('./Command');
const CommandResponse = require('./CommandResponse');

module.exports = class EchoCommand extends Command {
    constructor (logger) {
        super();
        this.logger = logger.child({subject: 'EchoCommand'});
    }

    supports (commandExchange) {
        return commandExchange.name === 'echo';
    }

    handle (commandExchange) {
        this.logger.info(`echo command received : ${commandExchange.args.join(' ')}`);

        commandExchange.connector.write(
            new CommandResponse(
                commandExchange.args.join(' '),
                commandExchange.sourceType,
                commandExchange.recipient,
                commandExchange.context
            )
        );
    }
};
