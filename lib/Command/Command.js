const CommandResponse = require('./CommandResponse');

module.exports = class Command {
    constructor (name, logger) {
        if (!name || name === '') {
            throw new Error();
        }
        this.name = name;
        this.logger = logger.child({subject: this.constructor.name});
    }

    /**
     * Indicates that must not be executed if the flag "paused" is on.
     * @returns {boolean}
     */
    canBePaused () {
        return true;
    }

    /**
     * Indicates that command response must not be sent if the flag "muted" is on.
     * @return {boolean}
     */
    canBeMuted() {
        return true;
    }

    /**
     * true : this command will not be listed
     * @returns {boolean}
     */
    isFake () {
        return false;
    }

    getFullName () {
        return this.name;
    }

    getAvailableConnectors () {
        return null;
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
     * verifies arguments of the command.
     * @param {CommandExchange} commandExchange
     * @return boolean
     */
    validate (commandExchange) {
        return false;
    }

    /**
     * handles the command and writes to the connector output.
     * @param {CommandExchange} commandExchange
     * @return {CommandResponse}
     */
    handle (commandExchange) {}

    /**
     * returns the usage message of the command.
     * @return string
     */
    usage () {
        return this.name;
    }

    /**
     * @param {CommandExchange} commandExchange
     * @param {CommandResponse} commandResponse
     * @return {Promise<void>}
     */
    async respond (commandExchange, commandResponse) {
        commandExchange.connector.write(commandResponse);
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
};
