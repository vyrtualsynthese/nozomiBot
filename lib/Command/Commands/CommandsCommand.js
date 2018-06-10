const Command = require('../Command');

module.exports = class CommandsCommand extends Command {
    constructor (logger) {
        super('command', logger);
    }

    isFake () {
        return true;
    }

    supports (commandExchange) {
        return commandExchange.name === this.name;
    }

    validate (commandExchange) {
        return false;
    }

    usage () {
        return `${this.name} list|create|remove`;
    }
};
