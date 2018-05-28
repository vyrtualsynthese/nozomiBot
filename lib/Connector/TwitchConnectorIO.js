const ConnectorIO = require('./ConnectorIO');
const CommandExchange = require('../Command/CommandExchange');
const tmi = require('tmi.js');

module.exports = class TwitchConnectorIO extends ConnectorIO {
    constructor (logger) {
        super();

        this.client = null;
        this.logger = logger.child({subject: 'TwitchConnectorIO'});
    }

    async init () {
        if (!process.env.TWITCH_IDENTITY_USER || !process.env.TWITCH_IDENTITY_PASSWORD) {
            console.error('[TwitchConnectorIO] TWITCH_IDENTITY_USER or TWITCH_IDENTITY_PASSWORD is not defined');
            this.logger.error('TWITCH_IDENTITY_USER or TWITCH_IDENTITY_PASSWORD is not defined');
            return;
        }
        await this._connect();
    }

    async _connect () {
        const options = {
            options: {
            },
            connection: {
                reconnect: true
            },
            identity: {
                username: process.env.TWITCH_IDENTITY_USER,
                password: process.env.TWITCH_IDENTITY_PASSWORD
            },
            channels: [process.env.TWITCH_CHANNEL],
            logger: this.logger
        };

        this.client = new tmi.Client(options);

        this.client.on('message', (channel, userstate, message, self) => {
            if (self) return;

            if (this.connectorManager === null) {
                return;
            }
            if (!message) {
                return;
            }
            const commandParsed = TwitchConnectorIO.parseCommand(message);

            switch (userstate['message-type']) {
                case 'action':
                    break;
                case 'chat':
                    this.connectorManager.newCommand(new CommandExchange(
                        commandParsed.commandName, commandParsed.args, this, 'channel', channel, {userstate}
                    ));
                    break;
                case 'whisper':
                    this.connectorManager.newCommand(new CommandExchange(
                        commandParsed.commandName, commandParsed.args, this, 'whisper', userstate.username, {userstate}
                    ));
                    break;
                default :
                    break;
            }
        });
        try {
            await this.client.connect();
        } catch (err) {
            console.error('[TwitchConnectorIO] failed to connect to Twitch');
            this.logger.error('failed to connect to Twitch');
        }
    }

    write (commandResponse) {
        switch (commandResponse.destinationType) {
            case 'channel':
                this.client.say(commandResponse.recipient, `${commandResponse.message}`);
                break;
            case 'whisper':
                this.client.whisper(commandResponse.recipient, `${commandResponse.message}`);
                break;
        }
    }
};
