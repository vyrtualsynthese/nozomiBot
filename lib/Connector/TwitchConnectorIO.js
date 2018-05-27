const ConnectorIO = require('./ConnectorIO');
const CommandExchange = require('../Command/CommandExchange');
const tmi = require('tmi.js');

module.exports = class TwitchConnectorIO extends ConnectorIO {
    constructor (logger) {
        super();

        this.client = null;
        this.logger = logger.child({subject: 'TwitchConnectorIO'});
        if (!process.env.TWITCH_IDENTITY_USER || !process.env.TWITCH_IDENTITY_PASSWORD) {
            this.logger.error('TWITCH_IDENTITY_USER or TWITCH_IDENTITY_PASSWORD is empty');
            console.error('[TwitchConnectorIO] TWITCH_IDENTITY_USER or TWITCH_IDENTITY_PASSWORD is empty');
            return;
        }
        this._connect();
    }

    _connect () {
        const options = {
            options: {
                debug: process.env.NODE_ENV === 'dev'
            },
            connection: {
                reconnect: true
            },
            identity: {
                username: process.env.TWITCH_IDENTITY_USER,
                password: process.env.TWITCH_IDENTITY_PASSWORD
            },
            channels: [process.env.TWITCH_CHANNEL]
        };

        this.client = new tmi.Client(options);

        this.client.on('message', (channel, userstate, message, self) => {
            if (self) return;

            if (this.connectorManager === null) {
                return;
            }

            const splitted = message.split(' ');
            let commandName = splitted.shift();
            if (commandName[0] === '!') {
                commandName = commandName.substr(1);
            }

            switch (userstate['message-type']) {
                case 'action':
                    break;
                case 'chat':
                    this.connectorManager.newCommand(new CommandExchange(commandName, splitted, this, 'channel', channel, {userstate}));
                    break;
                case 'whisper':
                    this.connectorManager.newCommand(new CommandExchange(commandName, splitted, this, 'whisper', userstate.username, {userstate}));
                    break;
                default :
                    break;
            }
        });
        this.client.connect();
    }

    write (commandResponse) {
        if (commandResponse.destinationType === 'channel') {
            this.client.say(commandResponse.recipient, commandResponse.message);
        } else if (commandResponse.destinationType === 'whisper') {
            this.client.whisper(commandResponse.recipient, commandResponse.message);
        }
    }
};
