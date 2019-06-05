const Command = require('./Command');
const CommandResponse = require('./CommandResponse');

/**
 * Pause command disables all the commands. Resume command for enable.
 * @type {module.PauseCommand}
 */
module.exports = class PauseCommand extends Command {
    constructor (logger, parametersRepo) {
        super('pause', logger);
        this.parametersRepo = parametersRepo;
    }

    canBePaused () {
        return false;
    }

    usage () {
        return `${this.name}`;
    }

    validate (commandExchange) {
        return commandExchange.args._.length === 0;
    }

    async handle (commandExchange) {
        this.logger.info('received');

        const parameters = await this.parametersRepo.retrieve();
        parameters.paused = true;

        let response = 'Les commandes peuvent se reposer. Tapez !resume pour les réactiver.';
        await this.parametersRepo.update(parameters).catch(err => {
            this.logger.error(`fail to update parameters : ${err}`);
            response = 'Impossible de mettre en pause les commandes.';
        });

        return new CommandResponse(
            response,
            commandExchange.sourceType,
            commandExchange.recipient,
            commandExchange.context
        );
    }
};
