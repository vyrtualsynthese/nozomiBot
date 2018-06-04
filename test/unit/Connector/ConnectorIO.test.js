process.env.NODE_ENV = 'test';

require('chai').should();

const ConnectorIO = require('../../../lib/Connector/ConnectorIO');

describe('Unit: ConnectorIO', () => {
    describe('setManager', () => {
        const ConnectorManager = {};

        it("'connectorManager' should match passed parameter", () => {
            const connector = new ConnectorIO();

            connector.setManager(ConnectorManager);
            connector.connectorManager.should.be.equal(ConnectorManager);
        });
        // TODO : Cas d'erreur
    });
    describe('Parse Command', () => {
        const command = '!tata titi toto';
        const CommandResponse = {
            commandName: 'tata',
            args: {
                _: ['titi', 'toto']}
        };

        it('should return an object type CommandResponse', () => {
            ConnectorIO.parseCommand(command).should.be.an('object').and.deep.equal(CommandResponse);
        });
        it('should throw an error', () => {
            (() => {
                ConnectorIO.parseCommand('');
            }).should.throw(Error);
        });
    });
});
