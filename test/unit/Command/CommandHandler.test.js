process.env.NODE_ENV = 'test';

require('chai').should();
const logger = require('pino')();

const CommandHandler = require('../../../lib/Command/CommandHandler');
const StaticCommandRepository = require('../../../lib/Database/Repository/StaticCommandRepository');
const ConnectorManager = require('../../../lib/Connector/ConnectorManager');

describe('Unit: CommandHandler', () => {

   describe('constructor', () => {

       const connectorManager = new ConnectorManager();
       const staticCommandRepository = new StaticCommandRepository();

       const commandHandler = new CommandHandler(connectorManager, staticCommandRepository, logger);

       it('should instantiate the CommandeHandler with passed parameters', () => {
           commandHandler.commands.should.be.deep.equal(Array());
           commandHandler.staticCommandRepository.should.be.deep.equal(staticCommandRepository);
       });
   });
   describe('registerCommand', () => {

       const command = 'toto';
       const connectorManager = new ConnectorManager();
       const staticCommandRepository = new StaticCommandRepository();

       const commandHandler = new CommandHandler(connectorManager, staticCommandRepository, logger);

       it("should push the passed command to 'commands'", () => {
           commandHandler.registerCommand(command);
           commandHandler.commands.should.be.deep.equal([command]);
       })
   });
});