process.env.NODE_ENV = 'test';

require('chai').should();
const expect = require('chai').expect;

const CommandExchange = require('../../../lib/Command/CommandExchange');
const ConnectorIO = require('../../../lib/Connector/ConnectorIO');

describe('Unit: CommandExchange', () => {

   describe('constructor', () => {

       const name = 'toto';
       const args = {
           _: ['tata', 'titi']
       };
       const connector = new ConnectorIO();
       const sourceType = 'wisper';
       const recipient = 'synthese';
       const context = {};

       it('should instantiate the CommandExchange with passed parameters', () => {

           const commandExchange = new CommandExchange(name, args, connector, sourceType, recipient, context);

           commandExchange.name.should.be.equal(name);
           commandExchange.args.should.be.deep.equal(args);
           commandExchange.connector.should.be.deep.equal(connector);
           commandExchange.sourceType.should.be.equal(sourceType);
           commandExchange.recipient.should.be.equal(recipient);
           commandExchange.context.should.be.deep.equal(context);
       });

       it('should instantiate the connector with passed parameters', () => {

           const commandExchange2 = new CommandExchange(name, args, connector);

           commandExchange2.name.should.be.equal(name);
           commandExchange2.args.should.be.deep.equal(args);
           commandExchange2.connector.should.be.deep.equal(connector);
           expect(commandExchange2.sourceType).to.be.null;
           expect(commandExchange2.recipient).to.be.null;
           commandExchange2.context.should.be.deep.equal(Object());
       });
   });
});