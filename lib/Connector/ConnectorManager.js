const EventEmitter = require('events');

module.exports = class ConnectorManager extends EventEmitter {
    constructor () {
        super();
        this.connectors = [];
    }

    addConnector (connector) {
        connector.setManager(this);
        this.connectors.push(connector);
    }

    newCommand (commandExchange) {
        this.emit('command', commandExchange);
    }
};
