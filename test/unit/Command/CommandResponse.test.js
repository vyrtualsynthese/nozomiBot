process.env.NODE_ENV = 'test';

require('chai').should();

const CommandResponse = require('../../../lib/Command/CommandResponse');

describe('Unit: CommandExchange', () => {

    describe('constructor', () => {

        const message = 'toto';
        const destinationType = 'twitch';
        const recipient = 'synthese';
        const context = {};

        it('should instantiate the CommandResponse with passed parameters', () => {

            const commandResponse = new CommandResponse(message, destinationType, recipient, context);

            commandResponse.message.should.be.equal(message);
            commandResponse.destinationType.should.be.equal(destinationType);
            commandResponse.recipient.should.be.equal(recipient);
            commandResponse.context.should.be.deep.equal(context);
        });
        it('should instantiate the CommandResponse with passed parameters using default valors of constructor', () => {

            const commandResponse = new CommandResponse(message, destinationType, recipient);

            commandResponse.message.should.be.equal(message);
            commandResponse.destinationType.should.be.equal(destinationType);
            commandResponse.recipient.should.be.equal(recipient);
            commandResponse.context.should.be.deep.equal({});
        });
    });
});