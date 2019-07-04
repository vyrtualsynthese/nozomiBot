const Command = require('./Command');
const CommandResponse = require('./CommandResponse');
const TwitchConnectorIO = require('../Connector/TwitchConnectorIO');
const moment = require('moment');

module.exports = class FollowsCheckCommand extends Command {
    constructor (logger, twitchApiHandler) {
        super('follows', logger);
        this.twitchApiHandler = twitchApiHandler;
    }

    supports (commandExchange) {
        return commandExchange.name === this.name
            && commandExchange.args._.length >= 1
            && commandExchange.args._[0] === 'check';
    }

    validate (commandExchange) {
        return commandExchange.args._.length === 2;
    }

    usage () {
        return `${this.name} check <username>.`;
    }

    getAvailableConnectors () {
        return [TwitchConnectorIO];
    }

    async handle (commandExchange) {
        this.logger.info(`received`);

        const username = `${commandExchange.args._[1]}`;

        let response = '';

        const userInfoFollow = await this.twitchApiHandler.getUserInfoFollow(username);

        if (!userInfoFollow) {
            response = `${username} n'existe pas ou ne follows pas cette chaine.`;
            return this._createResponse(commandExchange, response);
        }

        const until = moment(userInfoFollow._data.followed_at).format('LLL');

        response = `${username} follow la chaîne depuis le ${until}.`;
        return this._createResponse(commandExchange, response);
    }

    _createResponse (commandExchange, message) {
        return new CommandResponse(
            message,
            commandExchange.sourceType,
            commandExchange.recipient,
            commandExchange.context
        );
    }
};
