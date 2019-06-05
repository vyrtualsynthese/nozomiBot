const Command = require('./Command');
const CommandResponse = require('./CommandResponse');
const TwitchConnectorIO = require('../Connector/TwitchConnectorIO');

module.exports = class FollowsMessageCommand extends Command {
    constructor (logger, parametersRepo) {
        super('follows', logger);
        this.parametersRepo = parametersRepo;
    }

    supports (commandExchange) {
        return commandExchange.name === this.name
            && commandExchange.args._.length >= 1
            && commandExchange.args._[0] === 'message';
    }

    validate (commandExchange) {
        return commandExchange.args._.length === 2;
    }

    usage () {
        return `${this.name} message "<message to display>". Use "%username%" to display the follower's name.`;
    }

    getAvailableConnectors () {
        return [TwitchConnectorIO];
    }

    async handle (commandExchange) {
        this.logger.info(`received`);

        const message = `${commandExchange.args._[1]}`;

        const parameters = await this.parametersRepo.retrieve();
        parameters.followsMessage = message;

        let response = 'Le message des follows a été modifié avec succès.';
        await this.parametersRepo.update(parameters).catch(err => {
            this.logger.error(`fail to update parameters : ${err}`);
            response = 'Impossible de changer le message des follows.';
        });

        return new CommandResponse(
            response,
            commandExchange.sourceType,
            commandExchange.recipient,
            commandExchange.context
        );
    }
};
