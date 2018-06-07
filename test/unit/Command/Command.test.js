process.env.NODE_ENV = 'test';

require('chai').should();

const Command = require('../../../lib/Command/Command');
const logger = require('pino')();

describe('Unit: Command', () => {

   describe('constructor', () => {

       it('should instanciante the connector with passed parameters', () => {
           const command = new Command('command', logger);
           command.name.should.be.equal('command');
           command.logger.should.be.deep.equal(logger.child({subject: 'Command'}));
       });

       it('should throw an error if name parameter is undefined', () => {
           ( () => { let commandError = new Command(undefined, logger)}).should.throw(Error);
       });

       it('should throw an error if name parameter is empty', () => {
           ( () => { let commandError = new Command('', logger)}).should.throw(Error);
       });
   });

    const name = 'command';
    const command2 = new Command(name, logger);

    describe('isFake', () => {
        it('should return false when called', () => {
            command2.isFake().should.be.equal(false);
        });
    });
    describe('getFullName', () => {
        it("should return 'name'", () => {
            command2.getFullName().should.be.equal(name);
        });
    });
    describe('getAvailableConnectors', () => {
        it('should return null when called', () => {
            // TODO : Waiting for refactor from Ioni. Should'nt return null !
        });
    });
    describe('supports', () => {

        const commandeExchange = {
            name: name
        };
        const commandeExchangeFalse = {
            name: "toto"
        };

        it("should return 'true' if ", () => {
            command2.supports(commandeExchange).should.be.equal(true);
        });

        it("should return 'false'", () => {
            command2.supports(commandeExchangeFalse).should.be.equal(false);
        });
    });
    describe('validate', () => {
        const commandeExchange = {
            name: name
        };
        it("should return 'false'", () => {
            command2.validate(commandeExchange).should.be.equal(false);
        })
    });
    describe('usage', () => {
        it("should return 'name'", () => {
            command2.usage().should.be.equal(name);
        })
    });
});