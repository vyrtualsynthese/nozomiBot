process.env.NODE_ENV = 'test';

require('chai').should();

// Should mock the ConnectorManager class for further testing.
const ConnectorManager = require('../../../lib/Connector/ConnectorManager');

const connector = {
    setManager (connectorManager) {
        this.connectorManager = connectorManager;
    }
};

describe('Unit: Manager', () => {
    describe('addconnector', () => {
        it('Should call the methode setManager of the passed Object', () => {
            const connectorManager = new ConnectorManager();
            connectorManager.addConnector(connector);
            let buffer = connector.connectorManager;
            buffer.should.be.deep.equal(connectorManager);
        });
    });
    describe('newCommand', () => {
        // TODO
        it("Should emit en event named 'command' and an Object", () => {
        });
    });
});
