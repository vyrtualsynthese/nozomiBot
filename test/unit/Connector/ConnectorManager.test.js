process.env.NODE_ENV = 'test';

const sinon = require('sinon');
require('chai').should();

const ConnectorManager = require('../../../lib/Connector/ConnectorManager');
const ConnectorIO = require('../../../lib/Connector/ConnectorIO');
const CommandExchange = require('../../../lib/Command/CommandExchange');

describe('Unit: ConnectorManager', () => {
    describe('addconnector', () => {
        const connector = new ConnectorIO();
        const brokenConnector = {};

        it('Should call the methode setManager of the passed Object', () => {
            const connectorManager = new ConnectorManager();
            connectorManager.addConnector(connector);
            const buffer = connector.connectorManager;
            buffer.should.be.deep.equal(connectorManager);
        });
        // TODO : Manger circulare dependances imports between ConnectorManager & ConnectorIO to check the type of addConnector Parameter thank you Ioio. Allez Salut !
        /* it('Should throw an error if passing a bad object', () => {
            const connectorManager = new ConnectorManager();
            (() => {
                connectorManager.addConnector(connector);
            }).should.throw(Error);
        }); */
    });
    describe('newCommand', () => {

        const connectorManager = new ConnectorManager();
        const commandExchange = new CommandExchange();
        const fakeObject = {};
        const spy = sinon.spy(connectorManager, 'newCommand');

        beforeEach(() => {
            spy.resetHistory();
        });

        it("should get emitted events and emit an 'CommandExchange' object", () => {

            connectorManager.newCommand(commandExchange);

            spy.restore();
            spy.called.should.be.true;

        });
        it("should emit en event type command with an object typeof 'commandExchange'", () => {
            connectorManager.on('command', (commandExchange) => {
                commandExchange.should.be.deep.equal(commandExchange);
            });
        });
        it("should throw an error if a non 'CommandExchange' object is passed and should not emit event", () => {
            (() => {
                connectorManager.newCommand(fakeObject);
            }).should.throw(Error);

            spy.restore();
            spy.called.should.be.false;

        });
        it("should not emit anything on error cases", () => {
            connectorManager.on('command', (fakeObject) => {
                commandExchange.should.be.undefined;
            });
        })
    });
});
