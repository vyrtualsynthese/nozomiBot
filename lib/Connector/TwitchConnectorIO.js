const ConnectorIO = require('./ConnectorIO');
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
                    this.connectorManager.newCommand({
                        name: message,
                        connector: this,
                        context: {userstate}
                    });
                    break;
                case 'whisper':
                    break;
                default :
                    break;
            }
        });

        this.client.connect();
    }

    write (message) {
        // this.client.say('ashuvidz', "Je t'aime!");
    }
};
