const Command = require('./Command');
const CommandResponse = require('./CommandResponse');
const TwitchConnectorIO = require('../Connector/TwitchConnectorIO');

module.exports = class FollowsCommand extends Command {
    constructor (logger, parametersRepo) {
        super('follows', logger);
        this.parametersRepo = parametersRepo;
    }

    validate (commandExchange) {
        return commandExchange.args._.length === 1
            && commandExchange.args._[0].match(/^(on|off)$/);
    }

    usage () {
        return `${this.name} on|off`;
    }

    getAvailableConnectors () {
        return [TwitchConnectorIO];
    }

    async handle (commandExchange) {
        this.logger.info(`received`);

        const needToEnable = commandExchange.args._[0] === 'on';

        const parameters = await this.parametersRepo.retrieve();
        parameters.displayFollows = needToEnable;

        let response = parameters.displayFollows ? 'Les follows seront désormais annoncés.' : 'Les follows seront désormais cachés.';
        await this.parametersRepo.update(parameters).catch(err => {
            this.logger.error(`fail to update parameters : ${err}`);
            response = "Impossible de changer l'annonce des follows.";
        });

        return new CommandResponse(
            response,
            commandExchange.sourceType,
            commandExchange.recipient,
            commandExchange.context
        );
    }
};
