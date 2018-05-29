const Command = require('../Command');
const CommandResponse = require('../CommandResponse');

module.exports = class ListStaticCommandsCommand extends Command {
    constructor (logger, staticCommandRepository) {
        super('command', logger);
        this.staticCommandRepository = staticCommandRepository;
    }

    getFullName () {
        return `${this.name} list static`;
    }

    supports (commandExchange) {
        return commandExchange.name === this.name
            && commandExchange.args._.length >= 2
            && commandExchange.args._[0] === 'list'
            && commandExchange.args._[1] === 'static';
    }

    validate (commandExchange) {
        return commandExchange.args._.length === 2;
    }

    usage () {
        return `${this.name} list static`;
    }

    async handle (commandExchange) {
        this.logger.info(`received`);

        const commands = await this.staticCommandRepository.findAll().catch(err => {
            this.logger.error(`failed to find all static commands : ${err}`);
        });
        let responseMessage = '';
        if (!commands) {
            responseMessage = 'There are no static commands.';
        } else {
            for (let command of commands) {
                responseMessage += `${command.name}\r\n`;
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
