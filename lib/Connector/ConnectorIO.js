const yargs = require('yargs-parser');

module.exports = class ConnectorIO {
    setManager (connectorManager) {
        this.connectorManager = connectorManager;
    }
    write (message) {}
    static parseCommand (command) {
        const splitted = command.split(' ');
        let commandName = splitted.shift();
        if (commandName[0] === '!') {
            commandName = commandName.substr(1);
        }
        const args = yargs(splitted.join(' '));

        return {commandName, args};
    }
    getManager () {
        return this.connectorManager;
    }
    // async init () {}
};
