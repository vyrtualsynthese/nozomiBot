process.env.NODE_ENV = 'test';

require('chai').should();
const ConnectorIO = require('../../../lib/Connector/ConnectorIO');



describe('Unit: ConnectorIO', () => {
    it('should return and array of two', () => {
        let message = '!tata titi toto';
        ConnectorIO.parseCommand(message);
    });
});
