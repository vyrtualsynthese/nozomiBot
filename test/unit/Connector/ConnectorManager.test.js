process.env.NODE_ENV = 'test';

require('chai').should();
require('')

// Should mock the ConnectorManager class for further testing.
const ConnectorManager = require('../../../lib/Connector/ConnectorManager');

/* var event_api = {
    startTime: function() {
        return '123';
    }
}

//code to test
function getStartTime(e) {
    return e.startTime();
}

var mock = sinon.mock(event_api);
mock.expects("startTime").once();

getStartTime(event_api);
mock.verify(); */

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
