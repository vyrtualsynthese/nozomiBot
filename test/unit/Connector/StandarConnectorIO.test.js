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
            const standardConnectorIO = new StandardConnectorIO('exit', dbManager, cacheManager, webhookServer, logger);
            standardConnectorIO.exitCommand.should.be.equal('exit');
            standardConnectorIO.dbManager.should.be.equal(dbManager);
            standardConnectorIO.cacheManager.should.be.equal(cacheManager);
            standardConnectorIO.webhookServer.should.be.equal(webhookServer);
            standardConnectorIO.logger.should.be.deep.equal(logger.child({subject: 'StandardConnectorIO'}));
        });

        it('Should initiate StandardConnectorIO with his constructor with exitCommand undefined', () => {
            const standardConnectorIO2 = new StandardConnectorIO(undefined, dbManager, cacheManager, webhookServer, logger);
            standardConnectorIO2.exitCommand.should.be.equal('exit');
            standardConnectorIO2.dbManager.should.be.equal(dbManager);
            standardConnectorIO2.cacheManager.should.be.equal(cacheManager);
            standardConnectorIO2.webhookServer.should.be.equal(webhookServer);
            standardConnectorIO2.logger.should.be.deep.equal(logger.child({subject: 'StandardConnectorIO'}));
        });

        it('StandardConnectorIO should trow an Error with his constructor with exitCommand toto', () => {
            ( () => {let toto = new StandardConnectorIO('toto', dbManager, cacheManager, webhookServer, logger)}).should.throw(Error);
        });
    });
});
