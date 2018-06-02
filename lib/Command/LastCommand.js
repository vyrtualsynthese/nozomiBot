const Command = require('./Command');
const CommandResponse = require('./CommandResponse');
const TwitchConnectorIO = require('../Connector/TwitchConnectorIO');
const moment = require('moment');
moment.locale('fr');

module.exports = class LastCommand extends Command {
    constructor (logger, userRepository) {
        super('last', logger);
        this.userRepository = userRepository;
    }

    usage () {
        return `${this.name} <username>`;
    }

    validate (commandExchange) {
        return commandExchange.args._.length === 1;
    }

    getAvailableConnectors () {
        return [TwitchConnectorIO];
    }

    async handle (commandExchange) {
        const username = commandExchange.args._[0];
        this.logger.info(`received : ${username}`);

        let response = '';
        const user = await this.userRepository.findOneByUsername(username).catch(err => {
            this.logger.error(`failed to find the user ${username} : ${err}`);
        });
        if (!user) {
            response = `${username} n'est peut-être jamais venu...`;
        } else {
            const lastJoinedDate = moment(user.lastJoined);
            response = `La dernière fois que ${username} est venu était le ${lastJoinedDate.format('LL')} à ${lastJoinedDate.format('LT')}`;
        }

        commandExchange.connector.write(
            new CommandResponse(
                response,
                commandExchange.sourceType,
                commandExchange.recipient,
                commandExchange.context
            )
        );
    }
};
