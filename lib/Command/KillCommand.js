const Command = require('./Command');
const CommandResponse = require('./CommandResponse');

/**
 * Says "<source> a tué <target>" if source and target are valid people.
 * @type {module.KillCommand}
 */
module.exports = class KillCommand extends Command {
    constructor (logger) {
        super('kill', logger);
    }

    usage () {
        return `${this.name} <target>`;
    }

    supports (commandExchange) {
        return commandExchange.name === this.name
            && commandExchange.userProvider !== null
            && commandExchange.sourceUsername !== null;
    }

    validate (commandExchange) {
        return commandExchange.args._.length === 1;
    }

    async handle (commandExchange) {
        this.logger.info('received');

        const target = commandExchange.args._[0];
        // check if target is valid

        const targetUser = await commandExchange.userProvider.retrieveUser(target);

        if (targetUser === null) {
            this.logger.warning(`user ${target} not found with the provider ${commandExchange.userProvider.constructor.name}.`);
            return;
        }

        const response = `${commandExchange.sourceUsername} a tué ${targetUser.username}!`;

        return new CommandResponse(
            response,
            commandExchange.sourceType,
            commandExchange.recipient,
            commandExchange.context
        );
    }
};
