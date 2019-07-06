const Command = require('./Command');
const CommandResponse = require('./CommandResponse');
const TwitchConnectorIO = require('../Connector/TwitchConnectorIO');

module.exports = class GameCommand extends Command {
    constructor (logger, twitchAPIHandler) {
        super('game', logger);
        this.twitchAPIHandler = twitchAPIHandler;
    }

    usage () {
        return `${this.name}`;
    }

    validate (commandExchange) {
        return commandExchange.args._.length === 0;
    }

    getAvailableConnectors () {
        return [TwitchConnectorIO];
    }

    async handle (commandExchange) {
        this.logger.info('received');
        let response = '';

        const gameInfo = await this.twitchAPIHandler.getGameInfo();

        if (!gameInfo) {
            response = `Le stream n'est pas lancé`;
            return this._createResponse(commandExchange, response);
        }
        response = `Le stream est sur ${gameInfo._data.name}`;
        return this._createResponse(commandExchange, response);
    };
    _createResponse (commandExchange, message) {
        return new CommandResponse(
            message,
            commandExchange.sourceType,
            commandExchange.recipient,
            commandExchange.context
        );
    }
};
