process.env.NODE_ENV = 'test';

require('chai').should();
const expect = require('chai').expect;

const TwitchConnectorIO = require('../../../lib/Connector/TwitchConnectorIO');
const CacheManager = require('../../../lib/CacheManager');
const UserRepository = require('../../../lib/Database/Repository/UserRepository');
const ConnectorManager = require('../../../lib/Connector/ConnectorManager')
const logger = require('pino')();

describe('Unit: TwitchConnectorIO', () => {
    const cacheManager = new CacheManager(logger);
    const userRepository = new UserRepository();

    describe('constructor', () => {

        it('Should initiate TwitchConnectorIO with his constructor with exitCommand defined', () => {

            const connectorManagerTester = new TwitchConnectorIO(logger,cacheManager, userRepository);

            connectorManagerTester.apiBaseUrl.should.be.equal('https://api.twitch.tv/helix');
            expect(connectorManagerTester.client).to.be.null;
            connectorManagerTester.logger.should.be.deep.equal(logger.child({subject: 'TwitchConnectorIO'}));
            connectorManagerTester.userRepository.should.be.deep.equal(userRepository);
            connectorManagerTester.apiHeaders.should.be.an('object');
        });

    });

});
