const Command = require('./Command');
const CommandResponse = require('./CommandResponse');

/**
 * Mute all the commands' response. Unmute command for cancelling.
 * @type {module.MuteCommand}
 */
module.exports = class MuteCommand extends Command {
    constructor (logger, parametersRepo) {
        super('mute', logger);
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
        parameters.muted = true;

        let response = 'Les commandes sont maintenant muettes ! Tapez !unmute pour annuler.';
        await this.parametersRepo.update(parameters).catch(err => {
            this.logger.error(`fail to update parameters : ${err}`);
            response = 'Impossible de rendre les commandes muettes.';
        });

        return new CommandResponse(
            response,
            commandExchange.sourceType,
            commandExchange.recipient,
            commandExchange.context
        );
    }
};
