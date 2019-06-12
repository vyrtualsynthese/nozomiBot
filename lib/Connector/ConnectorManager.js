const EventEmitter = require('events');
const CommandExchange = require('../Command/CommandExchange');

module.exports = class ConnectorManager extends EventEmitter {
    addConnector (connector) {
        connector.setManager(this);
    }

    newCommand (commandExchange) {
        if (!(commandExchange instanceof CommandExchange)) {
            throw new Error();
        }
        this.emit('command', commandExchange);
    }
};
