const Command = require('../Command');
const CommandResponse = require('../CommandResponse');

module.exports = class RemoveStaticCommandCommand extends Command {
    constructor (logger, staticCommandRepository) {
        super('command', logger);
        this.staticCommandRepository = staticCommandRepository;
    }

    getFullName () {
        return `${this.name} remove`;
    }

    usage () {
        return `${this.name} remove <command name>`;
    }

    supports (commandExchange) {
        return commandExchange.name === this.name
            && commandExchange.args._.length >= 1
            && commandExchange.args._[0] === 'remove';
    }

    validate (commandExchange) {
        return commandExchange.args._.length === 2;
    }

    async handle (commandExchange) {
        const commandName = commandExchange.args._[1];

        let staticCommand = await this.staticCommandRepository.findOneByName(commandName).catch(err => {
            this.logger.warning(`failed to find the custom command ${commandName} : ${err}`);
        });

        if (!staticCommand) {
            this._sendResponse(commandExchange, `La commande ${commandName} n'existe pas.`);
            return;
        }

        this.staticCommandRepository.remove(staticCommand).then(() => {
            this.logger.info(`custom command ${commandName} has been removed`);
            this._sendResponse(commandExchange, `La commande custom "${commandName}" a été supprimée.`);
        }).catch(err => {
            this.logger.error(`failed to remove the custom command ${commandName} : ${err}`);
            this._sendResponse(commandExchange, `Impossible de supprimer la commande custom "${commandName}".`);
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
