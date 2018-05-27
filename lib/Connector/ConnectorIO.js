const CommandExchange = require('../Command/CommandExchange');

module.exports = class ConnectorIO {
    constructor (connectorManager = null) {
        this.connectorManager = connectorManager;
    }
    setManager (connectorManager) {
        this.connectorManager = connectorManager;
    }
    write (message) {}
    parseCommand (command) {
        const splitted = command.split(' ');
        let commandName = splitted.shift();
        if (commandName[0] === '!') {
            commandName = commandName.substr(1);
        }
        return new CommandExchange(commandName, splitted, this);
    }
};
