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

        let newStaticCommand = await this.staticCommandRepository.findOneByName(commandName).catch(_ => {});
        if (newStaticCommand) {
            newStaticCommand.response = commandResponse;
        } else {
            newStaticCommand = new StaticCommand({
                name: commandName,
                response: commandResponse
            });
        }

        let response = null;
        await this.staticCommandRepository.create(newStaticCommand).catch(err => {
            this.logger.error(`failed to add new custom command : ${err}`);
            response = this._sendResponse(commandExchange, `Impossible de créer la commande custom ${commandName}.`);
        });
        if (response !== null) {
            return response;
        }
        this.logger.info(`new custom command added : ${commandName}`);
        return this._sendResponse(commandExchange, `Nouvelle commande custom ajoutée : ${commandName}.`);
    }

    _sendResponse (commandExchange, message) {
        return new CommandResponse(
            message,
            commandExchange.sourceType,
            commandExchange.recipient,
            commandExchange.context
        );
    }
};
