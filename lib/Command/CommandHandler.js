const CommandResponse = require('./CommandResponse');

module.exports = class CommandHandler {
    constructor (connectorManager, staticCommandRepository, logger, parametersRepo) {
        this.commands = [];
        this.staticCommandRepository = staticCommandRepository;
        this.parametersRepo = parametersRepo;
        this.logger = logger.child({subject: this.constructor.name});
        connectorManager.on('command', (commandExchange) => {
            this.handle(commandExchange);
        });
    }

    registerCommand (command) {
        this.commands.push(command);
    }

    async handle (commandExchange) {
        const parameters = await this.parametersRepo.retrieve();

        for (let command of this.commands) {
            if (command.getAvailableConnectors() !== null) {
                let available = false;
                for (let availableConnector of command.getAvailableConnectors()) {
                    if (commandExchange.connector instanceof availableConnector) {
                        available = true;
                        break;
                    }
                }
                if (!available) {
                    continue;
                }
            }
            if (!command.supports(commandExchange)) {
                continue;
            }
            if (parameters.paused && command.canBePaused()) {
                return;
            }
            if (!command.validate(commandExchange)) {
                command.displayUsage(commandExchange);
                return;
            }
            const commandResponse = await command.handle(commandExchange);
            if (parameters.muted && command.canBeMuted()) {
                return;
            }
            if (commandResponse) {
                command.respond(commandExchange, commandResponse);
            }

            return;
        }

        if (await this._browseStaticCommands(commandExchange)) {
            return;
        }

        this.logger.info(`no commands found for "${commandExchange.name}"`);
        // commandExchange.connector.write(new CommandResponse(
        //     `${commandExchange.name} n'est pas une commande.`,
        //     commandExchange.sourceType,
        //     commandExchange.recipient,
        //     commandExchange.context
        // ));
    }

    /**
     * @param {CommandExchange} commandExchange
     * @return {Promise<boolean>} true if a command has been handled
     * @private
     */
    async _browseStaticCommands (commandExchange) {
        const commands = await this.staticCommandRepository.findAll().catch(err => {
            this.logger.error(`failed to find all custom commands : ${err}`);
        });
        if (!commands) {
            return false;
        }
        for (let command of commands) {
            if (command.name !== commandExchange.name) {
                continue;
            }
            this.logger.info(`custom command received : ${command.name}`);
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
