process.env.NODE_ENV = 'test';

require('chai').should();
const ConnectorIO = require('../../../lib/Connector/ConnectorIO');

const Connector = new ConnectorIO();

describe('Unit: ConnectorIO', () => {
    describe('setManager', () => {
        it('should set [connectorManager] to the same as [input]', () => {
            Connector.setManager('toto')
            Connector.getManager().should.be.equal('toto');
        });
    });
    it('should return and array of two', () => {
        ConnectorIO.parseCommand('!tata titi toto').should.be.an('object');
    });
});
