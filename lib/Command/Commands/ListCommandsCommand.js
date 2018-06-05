const Command = require('../Command');
const CommandResponse = require('../CommandResponse');

module.exports = class StaticCommandsCommand extends Command {
    constructor (logger, staticCommandRepository, commandHandler) {
        super('command', logger);
        this.staticCommandRepository = staticCommandRepository;
        this.commandHandler = commandHandler;
    }

    getFullName () {
        return `${this.name} list`;
    }

    supports (commandExchange) {
        return commandExchange.name === this.name
            && commandExchange.args._.length >= 1
            && commandExchange.args._[0] === 'list';
    }

    validate (commandExchange) {
        return commandExchange.args._.length === 1;
    }

    usage () {
        return `${this.name} list [static]`;
    }

    async handle (commandExchange) {
        this.logger.info(`received`);

        let responseMessage = '';
        let thereAreCommands = false;

        const dynamicCommandsResponse = this._getDynamicCommands();
        if (dynamicCommandsResponse !== '') {
            thereAreCommands = true;
            responseMessage += dynamicCommandsResponse;
        }

        const staticCommandsResponse = await this._getStaticCommands();
        if (staticCommandsResponse !== '') {
            thereAreCommands = true;
            responseMessage += staticCommandsResponse;
        }

        if (!thereAreCommands) {
            responseMessage = "Il n'y a aucune commande.";
        }

        commandExchange.connector.write(
            new CommandResponse(
                responseMessage,
                commandExchange.sourceType,
                commandExchange.recipient,
                commandExchange.context
            )
        );
    }

    _getDynamicCommands () {
        let res = '';
        for (let command of this.commandHandler.commands) {
            if (command.isFake()) {
                continue;
            }
            res += `!${command.getFullName()}\n`;
        }

        return res;
    }

    async _getStaticCommands () {
        let res = '';
        const commands = await this.staticCommandRepository.findAll().catch(err => {
            this.logger.error(`failed to find all static commands : ${err}`);
        });
        if (commands) {
            for (let command of commands) {
                res += `!${command.name}\n`;
            }
        }

        return res;
    }
};
