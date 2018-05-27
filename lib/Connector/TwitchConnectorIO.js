const ConnectorIO = require('./ConnectorIO');
const CommandExchange = require('../Command/CommandExchange');
const tmi = require('tmi.js');

module.exports = class TwitchConnectorIO extends ConnectorIO {
    constructor (connectorManager = null) {
        super(connectorManager);
        const options = {
            options: {
                debug: process.env.NODE_ENV === 'dev'
            },
            connection: {
                reconnect: true
            },
            identity: {
                username: process.env.TWITCH_BOT_USER,
                password: process.env.TWITCH_BOT_OAUTH
            },
            channels: ['#ashuvidz']
        };

        this.client = new tmi.Client(options);

        this.client.on('message', (channel, userstate, message, self) => {
            if (self) return;

            if (this.connectorManager === null) {
                return;
            }
            switch (userstate['message-type']) {
                case 'action':
                    break;
                case 'chat':
                    this.connectorManager.newCommand(new CommandExchange(message, {userstate}, this));
                    break;
                case 'whisper':
                    break;
                default :
                    break;
            }
        });

        this.client.connect();
    }

    write (commandResponse) {
        this.client.say(commandResponse.context.channel, "Je t'aime!");
    }
};
