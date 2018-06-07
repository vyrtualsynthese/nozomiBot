process.env.NODE_ENV = 'test';

require('chai').should();

const logger = require('pino')();

const StandardConnectorIO = require('../../../lib/Connector/StandardConnectorIO');
const DatabaseManager = require('../../../lib/Database/DatabaseManager');
const CacheManager = require('../../../lib/CacheManager');
const WebhookServer = require('../../../lib/Webhook/WebhookServer');

describe('Unit: StandardConnectorIO', () => {
    const dbManager = new DatabaseManager(logger);
    const cacheManager = new CacheManager(logger);
    const webhookServer = new WebhookServer(logger, 3000);

    describe('constructor', () => {

        it('Should initiate StandardConnectorIO with his constructor with exitCommand defined', () => {
            const connectorManagerTester = new StandardConnectorIO('exit', dbManager, cacheManager, webhookServer, logger);
            connectorManagerTester.exitCommand.should.be.equal('exit');
            connectorManagerTester.dbManager.should.be.equal(dbManager);
            connectorManagerTester.cacheManager.should.be.equal(cacheManager);
            connectorManagerTester.webhookServer.should.be.equal(webhookServer);
            connectorManagerTester.logger.should.be.deep.equal(logger.child({subject: 'StandardConnectorIO'}));
        });

        it('Should initiate StandardConnectorIO with his constructor with exitCommand undefined', () => {
            const connectorManagerTester2 = new StandardConnectorIO(undefined, dbManager, cacheManager, webhookServer, logger);
            connectorManagerTester2.exitCommand.should.be.equal('exit');
            connectorManagerTester2.dbManager.should.be.equal(dbManager);
            connectorManagerTester2.cacheManager.should.be.equal(cacheManager);
            connectorManagerTester2.webhookServer.should.be.equal(webhookServer);
            connectorManagerTester2.logger.should.be.deep.equal(logger.child({subject: 'StandardConnectorIO'}));
        });

        it('StandardConnectorIO should trow an Error with his constructor with exitCommand toto', () => {
            ( () => {let toto = new StandardConnectorIO('toto', dbManager, cacheManager, webhookServer, logger)}).should.throw(Error);


        });
    });
});
