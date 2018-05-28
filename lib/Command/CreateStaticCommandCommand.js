const Command = require('./Command');
const CommandResponse = require('./CommandResponse');
const StaticCommand = require('../Database/Model/StaticCommand');

module.exports = class CreateStaticCommandCommand extends Command {
    constructor (logger, staticCommandRepository) {
        super('createcommand', logger);
        this.staticCommandRepository = staticCommandRepository;
    }

    usage () {
        return `${this.name} <command name> "<command response>"`;
    }

    validate (commandExchange) {
        return commandExchange.args._.length === 2;
    }

    supports (commandExchange) {
        return commandExchange.name === this.name;
    }

    handle (commandExchange) {
        const commandName = commandExchange.args._[0];
        const commandResponse = commandExchange.args._[1];

        // TODO : find command and update it if exists

        const newStaticCommand = new StaticCommand({
            name: commandName,
            response: commandResponse
        });

        this.staticCommandRepository.create(newStaticCommand).then(() => {
            this.logger.info(`new static command added : ${commandName}`);
            this._sendResponse(commandExchange, `New static command added : ${commandName}`);
        }).catch(err => {
            this.logger.error(`failed to add new static command : ${err}`);
            this._sendResponse(commandExchange, `Unable to create the static command ${commandName}`);
        });
    }

    _sendResponse (commandExchange, message) {
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