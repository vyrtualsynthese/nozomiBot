process.env.NODE_ENV = 'test';

require('chai').should();

// Should mock the ConnectorManager class for further testing.
const ConnectorIO = require('../../../lib/Connector/ConnectorIO');

describe('Unit: ConnectorIO', () => {
    describe('setManager', () => {
        it("'connectorManager' should match passed parameter", () => {
            const connector = new ConnectorIO();
            const connectorManager = 'toto';

            connector.setManager(connectorManager);
            connector.connectorManager.should.be.equal(connectorManager);
        });
    });
    describe('Parse Command', () => {
        it('should return and array of two', () => {
            ConnectorIO.parseCommand('!tata titi toto').should.be.an('object');
        });
        it('should throw an error', () => {
            (() => {
                ConnectorIO.parseCommand('');
            }).should.throw(Error);
        });
    });
});

/* function iThrowError () {
    throw new Error('Error thrown');
}

describe('The app', function () {
    describe('this feature', function () {
        it('is a function', function () {
            iThrowError.should.throw(Error, 'Error thrown');
        });
    });
}); */
