process.env.NODE_ENV = 'test';

require('chai').should();
const expect = require('chai').expect;

const TwitchConnectorIO = require('../../../lib/Connector/TwitchConnectorIO');
const UserRepository = require('../../../lib/Database/Repository/UserRepository');
const logger = require('pino')();

describe('Unit: TwitchConnectorIO', () => {
    const userRepository = new UserRepository();

    describe('constructor', () => {

        it('Should initiate TwitchConnectorIO with his constructor with exitCommand defined', () => {

            const connectorManagerTester = new TwitchConnectorIO(logger, userRepository);

            expect(connectorManagerTester.client).to.be.null;
            connectorManagerTester.logger.should.be.deep.equal(logger.child({subject: 'TwitchConnectorIO'}));
            connectorManagerTester.userRepository.should.be.deep.equal(userRepository);
        });

    });

});
