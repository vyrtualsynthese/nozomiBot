const Command = require('./Command');
const CommandResponse = require('./CommandResponse');

module.exports = class EchoCommand extends Command {
    supports (commandExchange) {
        return commandExchange.name === 'echo';
    }

    handle (commandExchange) {
        commandExchange.connector.write(
            new CommandResponse(`${commandExchange.name} ${commandExchange.args.join(' ')}`)
        );
    }
};
