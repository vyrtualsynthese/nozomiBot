const Command = require('../Command');
const CommandResponse = require('../CommandResponse');
const StaticCommand = require('../../Database/Model/StaticCommand');

module.exports = class CreateStaticCommandCommand extends Command {
    constructor (logger, staticCommandRepository) {
        super('command', logger);
        this.staticCommandRepository = staticCommandRepository;
    }

    getFullName () {
        return `${this.name} create`;
    }

    usage () {
        return `${this.name} create <command name> "<command response>"`;
    }

    supports (commandExchange) {
        return commandExchange.name === this.name
            && commandExchange.args._.length >= 1
            && commandExchange.args._[0] === 'create';
    }

    validate (commandExchange) {
        return commandExchange.args._.length === 3;
    }

    async handle (commandExchange) {
        const commandName = commandExchange.args._[1];
        const commandResponse = commandExchange.args._[2];

        let newStaticCommand = await this.staticCommandRepository.findOneByName(commandName).catch(err => {
            this.logger.error(`failed to find one command by name : ${err}`);
        });
        if (newStaticCommand) {
            newStaticCommand.response = commandResponse;
        } else {
            newStaticCommand = new StaticCommand({
                name: commandName,
                response: commandResponse
            });
        }

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