const Command = require('./Command');
const CommandResponse = require('./CommandResponse');

/**
 * Unmute the commands' response.
 * @type {module.UnmuteCommand}
 */
module.exports = class UnmuteCommand extends Command {
    constructor (logger, parametersRepo) {
        super('unmute', logger);
        this.parametersRepo = parametersRepo;
    }

    usage () {
        return `${this.name}`;
    }

    validate (commandExchange) {
        return commandExchange.args._.length === 0;
    }

    canBeMuted () {
        return false;
    }

    async handle (commandExchange) {
        this.logger.info('received');

        const parameters = await this.parametersRepo.retrieve();
        parameters.muted = false;

        let response = 'Les commandes ont retrouvé leur voix !';
        await this.parametersRepo.update(parameters).catch(err => {
            this.logger.error(`fail to update parameters : ${err}`);
            response = 'Impossible de rendre la voix aux commandes.';
        });

        return new CommandResponse(
            response,
            commandExchange.sourceType,
            commandExchange.recipient,
            commandExchange.context
        );
    }
};
