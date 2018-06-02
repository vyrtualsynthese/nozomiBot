process.env.NODE_ENV = 'test';

require('chai').should();

// Should mock the ConnectorManager class for further testing.
const ConnectorManager = require('../../../lib/Connector/ConnectorManager');

describe('Unit: Manager', () => {
    describe('addconnector', () => {
        // TODO
        it('Should call the methode setManager of the passed Object', () => {
        });
    });
    describe('newCommand', () => {
        // TODO
        it("Should emit en event named 'command' and an object", () => {
        });
    });
});
