process.env.NODE_ENV = 'test';

require('chai').should();
const sinon = require('sinon');
const logger = require('pino')();

const EchoCommand = require('../../../lib/Command/EchoCommand');
const CommandExchange = require('../../../lib/Command/CommandExchange');
const ConnectorIO = require('../../../lib/Connector/ConnectorIO');

describe('Unit: EchoCommand', () => {

    describe('constructor', () => {

        it('should instantiate the EchoCommand with passed parameters', () => {

            const echoCommand = new EchoCommand(logger);
            echoCommand.name.should.be.equal('echo');
            echoCommand.logger.should.be.deep.equal(logger.child({subject: 'EchoCommand'}));

        });

    });

    describe('usage', () => {

        it("should return 'echo <message to display>'", () => {

            const echoCommand = new EchoCommand(logger);
            echoCommand.usage().should.be.equal( 'echo <message to display>' );

        })

    })

    describe('validate', () => {

        it(' should return true if passed command exchange is > 0 ', () => {

            const echoCommand = new EchoCommand(logger);
            const commandExchange = {
                args : {
                    _: [ "pedoncule", "titi" ]
                }
            };

            echoCommand.validate(commandExchange).should.be.true;

        });

        it(' should return false if passed command exchange is > 0 ', () => {

            const echoCommand = new EchoCommand(logger);
            const commandExchange = {
                args : {
                    _: [ ]
                }
            };

            echoCommand.validate(commandExchange).should.be.false;

        });

    });

    describe('handle', () => {

        it(' should return a CommandResponse with the correct message ', () => {

            const name = 'toto';
            const args = {
                _: ['tata', 'titi']
            };
            const connector = new ConnectorIO();
            const sourceType = 'whisper';
            const recipient = 'synthese';
            const context = {};

            const commandExchange = new CommandExchange(name, args, connector, sourceType, recipient, context, recipient);

            const echoCommand = new EchoCommand(logger);
            echoCommand.handle(commandExchange).should.be.deep.equal({
                message: 'tata titi',
                destinationType: 'whisper',
                recipient: 'synthese',
                context: {},
            });

        });

    })

});
