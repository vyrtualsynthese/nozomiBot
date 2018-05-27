const CommandResponse = require('./CommandResponse');

module.exports = class CommandHandler {
    constructor (connectorManager, staticCommandRepository, logger) {
        this.commands = [];
        this.staticCommandRepository = staticCommandRepository;
        this.logger = logger.child({subject: this.constructor.name});
        connectorManager.on('command', (commandExchange) => {
            this.handle(commandExchange);
        });
    }

    registerCommand (command) {
        this.commands.push(command);
    }

    async handle (commandExchange) {
        for (let command of this.commands) {
            if (!command.supports(commandExchange)) {
                continue;
            }
            if (!command.validate(commandExchange)) {
                command.displayUsage(commandExchange);
                continue;
            }
            command.handle(commandExchange);
            return;
        }

        if (await this._browseStaticCommands(commandExchange)) {
            return;
        }

        this.logger.info(`no command found for "${commandExchange.name}"`);
        commandExchange.connector.write(new CommandResponse(
            `${commandExchange.name} is not a command!`,
            commandExchange.sourceType,
            commandExchange.recipient,
            commandExchange.context
        ));
    }

    /**
     * @param {CommandExchange} commandExchange
     * @return {Promise<boolean>} true if a command has been handled
     * @private
     */
    async _browseStaticCommands (commandExchange) {
        const commands = await this.staticCommandRepository.findAll().catch(err => {
            this.logger.error(`failed to find all static commands : ${err}`);
        });
        if (!commands) {
            return false;
        }
        for (let command of commands) {
            if (command.name !== commandExchange.name) {
                continue;
            }
            this.logger.info(`static command received : ${command.name}`);
            commandExchange.connector.write(new CommandResponse(
                command.response,
                commandExchange.sourceType,
                commandExchange.recipient,
                commandExchange.context
            ));
            return true;
        }

        return false;
    }
};
