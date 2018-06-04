const EventEmitter = require('events');
const ConnectorIO = require('./ConnectorIO');

module.exports = class ConnectorManager extends EventEmitter {
    addConnector (connector) {
        if (!(connector instanceof ConnectorIO)) {
            throw new Error();
        }
        connector.setManager(this);
    }

    newCommand (commandExchange) {
        this.emit('command', commandExchange);
    }
};
