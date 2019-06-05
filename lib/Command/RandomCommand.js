const Command = require('./Command');
const CommandResponse = require('./CommandResponse');

module.exports = class RandomCommand extends Command {
    constructor (logger) {
        super('random', logger);
    }

    usage () {
        return `${this.name} <nombre entier supérieur à 1>`;
    }

    validate (commandExchange) {
        return commandExchange.args._.length === 1
            && typeof commandExchange.args._[0] === 'number'
            && commandExchange.args._[0] > 1
            && Number.isSafeInteger(commandExchange.args._[0]);
    }

    /**
     * @param {number} min
     * @param {number} max
     * @return {number} random number between min and max included
     * @private
     */
    static _randomInt (min, max) {
        return Math.floor(Math.random() * (max + 1 - min) + min);
    }

    handle (commandExchange) {
        const number = commandExchange.args._[0];
        const rand = RandomCommand._randomInt(1, number);

        this.logger.info(`received ${this.name} ${number} = ${rand}`);

        return new CommandResponse(
            rand,
            commandExchange.sourceType,
            commandExchange.recipient,
            commandExchange.context
        );
    }
};
