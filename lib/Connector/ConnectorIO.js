const yargs = require('yargs-parser');
const ConnectorManager = require('./ConnectorManager');

module.exports = class ConnectorIO {
    setManager (connectorManager) {
        if (!(connectorManager instanceof ConnectorManager)) {
            throw new Error();
        }
        this.connectorManager = connectorManager;
    }
    write (message) {}
    static parseCommand (command) {
        if (command.length === 0) {
            throw new Error('command cannot be empty');
        }
        const splitted = command.split(' ');
        let commandName = splitted.shift();
        if (commandName[0] === '!') {
            commandName = commandName.substr(1);
        }
        const args = yargs(splitted.join(' '));

        return {commandName, args};
    }
    // async init () {}
};
