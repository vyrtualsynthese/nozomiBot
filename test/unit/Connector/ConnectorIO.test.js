process.env.NODE_ENV = 'test';

require('chai').should();

const ConnectorIO = require('../../../lib/Connector/ConnectorIO');
const ConnectorManager = require('../../../lib/Connector/ConnectorManager');

describe('Unit: ConnectorIO', () => {
    describe('setManager', () => {

        const connectorManager = new ConnectorManager();
        const connector = new ConnectorIO();
        const fakeObject = {};

        it("'connectorManager' should match passed parameter", () => {

            connector.setManager(connectorManager);
            connector.connectorManager.should.be.equal(connectorManager);

        });

        it("should throw an error if the passed objectf is not typeof 'ConnectorManager'", () => {
            (() => {
                connector.setManager(fakeObject);
            }).should.throw(Error);
        })
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
