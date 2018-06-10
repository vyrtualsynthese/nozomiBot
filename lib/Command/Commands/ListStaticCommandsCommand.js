const Command = require('../Command');
const CommandResponse = require('../CommandResponse');

module.exports = class ListStaticCommandsCommand extends Command {
    constructor (logger, staticCommandRepository) {
        super('command', logger);
        this.staticCommandRepository = staticCommandRepository;
    }

    getFullName () {
        return `${this.name} list custom`;
    }

    supports (commandExchange) {
        return commandExchange.name === this.name
            && commandExchange.args._.length >= 2
            && commandExchange.args._[0] === 'list'
            && commandExchange.args._[1] === 'custom';
    }

    validate (commandExchange) {
        return commandExchange.args._.length === 2;
    }

    usage () {
        return `${this.name} list custom`;
    }

    async handle (commandExchange) {
        this.logger.info(`received`);

        const commands = await this.staticCommandRepository.findAll().catch(err => {
            this.logger.error(`failed to find all custom commands : ${err}`);
        });
        let responseMessage = '';
        if (!commands || commands.length === 0) {
            responseMessage = "Il n'y a pas de commande custom.";
        } else {
            for (let command of commands) {
                responseMessage += `!${command.name}\n`;
            }
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
};
