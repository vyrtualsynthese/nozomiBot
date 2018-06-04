process.env.NODE_ENV = 'test';

const sinon = require('sinon');
require('chai').should();

const ConnectorManager = require('../../../lib/Connector/ConnectorManager');
const ConnectorIO = require('../../../lib/Connector/ConnectorIO');

describe('Unit: ConnectorManager', () => {
    describe('addconnector', () => {
        const connector = new ConnectorIO();
        const brokenConnector = {};

        it('Should call the methode setManager of the passed Object', () => {
            const connectorManager = new ConnectorManager();
            connectorManager.addConnector(connector);
            let buffer = connector.connectorManager;
            buffer.should.be.deep.equal(connectorManager);
        });
        it('Should throw an error if passing a bad object', () => {
            const connectorManager = new ConnectorManager();
            (() => {
                connectorManager.addConnector(brokenConnector);
            }).should.throw(Error);
        });
    });
    describe('newCommand', () => {
        const commandExchange = {};
        const connectorManager = new ConnectorManager();

        it('should get emitted events', function () {
            const spy = sinon.spy(connectorManager, 'newCommand');

            connectorManager.newCommand(commandExchange);
            spy.restore();

            spy.called.should.be.true;

            connectorManager.on('command', (commandExchange) => {
                commandExchange.should.be.deep.equal(commandExchange);
            });
        });
        // TODO : Finis le car d'erreur
    });
});
