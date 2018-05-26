module.exports = class ConnectorIO {
    constructor (connectorManager = null) {
        this.connectorManager = connectorManager;
    }
    setManager (connectorManager) {
        this.connectorManager = connectorManager;
    }
    write (message) {}
};
