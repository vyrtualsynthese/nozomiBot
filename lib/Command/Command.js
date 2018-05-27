const CommandResponse = require('./CommandResponse');

module.exports = class Command {
    constructor (name, logger) {
        this.name = name;
        this.logger = logger.child({subject: this.constructor.name});
    }

    /**
     * returns true if this Command can handle the request.
     * @param {CommandExchange} commandExchange
     * @return boolean
     */
    supports (commandExchange) {
        return commandExchange.name === this.name;
    }

    /**
     * handles the command and writes to the connector output.
     * @param {CommandExchange} commandExchange
     */
    handle (commandExchange) {}

    /**
     * returns the usage message of the command.
     * @return string
     */
    usage () {
        return this.name;
    }

    displayUsage (commandExchange) {
        commandExchange.connector.write(
            new CommandResponse(
                `Usage : ${this.usage()}`,
                commandExchange.sourceType,
                commandExchange.recipient,
                commandExchange.context
            )
        );
    }

    /**
     * verifies arguments of the command.
     * @param {CommandExchange} commandExchange
     * @return boolean
     */
    validate (commandExchange) {
        return false;
    }
};
