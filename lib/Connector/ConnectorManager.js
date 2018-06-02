const EventEmitter = require('events');

module.exports = class ConnectorManager extends EventEmitter {
    // no uses of "connectors" array as for now
    /* constructor () {
        super();
        this.connectors = [];
    } */

    addConnector (connector) {
        connector.setManager(this);
        // this.connectors.push(connector);
    }

    newCommand (commandExchange) {
        this.emit('command', commandExchange);
    }
};
