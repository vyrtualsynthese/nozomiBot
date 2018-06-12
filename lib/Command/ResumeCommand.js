const Command = require('./Command');
const CommandResponse = require('./CommandResponse');

/**
 * Enables all the commands. Pause command for disable.
 * @type {module.ResumeCommand}
 */
module.exports = class ResumeCommand extends Command {
    constructor (logger, parametersRepo) {
        super('resume', logger);
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
        parameters.paused = false;

        let response = 'Les commandes se sont réveillées! Tapez !pause pour les désactiver.';
        await this.parametersRepo.update(parameters).catch(err => {
            this.logger.error(`fail to update parameters : ${err}`);
            response = "Impossible d'activer les commandes.";
        });

        return new CommandResponse(
            response,
            commandExchange.sourceType,
            commandExchange.recipient,
            commandExchange.context
        );
    }
};
