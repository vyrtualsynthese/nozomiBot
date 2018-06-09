const ConnectorIO = require('./ConnectorIO');
const CommandExchange = require('../Command/CommandExchange');
const User = require('../Database/Model/User');
const tmi = require('tmi.js');
const moment = require('moment');

module.exports = class TwitchConnectorIO extends ConnectorIO {
    constructor (logger, userRepository) {
        super();

        this.client = null;
        this.logger = logger.child({subject: this.constructor.name});
        this.userRepository = userRepository;
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

        this.client.on('join', (channel, username, self) => {
            if (self) return;
            this.onJoin(channel, username);
        });
        this.client.on('part', (channel, username, self) => {
            if (self) return;
            this.onLeave(channel, username);
        });
        this.client.on('message', (channel, userstate, message, self) => {
            if (self) return;
            this.onMessage(channel, userstate, message);
        });
        try {
            console.log('connection to Twitch IRC...');
            await this.client.connect();
            console.log('Twitch IRC connected');
        } catch (err) {
            console.error(`[TwitchConnectorIO] failed to connect to Twitch : ${err}`);
            this.logger.error(`failed to connect to Twitch : ${err}`);
        }
    }

    async onJoin (channel, username) {
        if (this.connectorManager === null) {
            return;
        }
        this.logger.info(`the user ${username} has joined`);

        let user = await this.userRepository.findOneByUsername(username).catch(err => {
            this.logger.error(`failed to find the user ${username} : ${err}`);
        });
        if (user) {
            if (user.lastLeaved !== null && moment(user.lastJoined).valueOf() > moment(user.lastLeaved).valueOf()) {
                // did not received a "leave" event
                user.joinedUptime += (moment(new Date()).valueOf() - moment(user.lastJoined).valueOf()) / 1000;
            }
            user.lastJoined = new Date();
        } else {
            user = new User({
                username: username,
                lastJoined: new Date(),
            });
        }

        this.userRepository.create(user).then(() => {
            this.logger.info(`user ${user.username} has been created/updated`);
        }).catch(err => {
            this.logger.error(`failed to create/update user : ${err}`);
        });
    }

    async onLeave (channel, username) {
        if (this.connectorManager === null) {
            return;
        }
        this.logger.info(`the user ${username} has leaved`);

        let user = await this.userRepository.findOneByUsername(username).catch(err => {
            this.logger.error(`failed to find the user ${username} : ${err}`);
        });
        if (user) {
            user.lastLeaved = new Date();
            user.joinedUptime += (moment(user.lastLeaved).valueOf() - moment(user.lastJoined).valueOf()) / 1000;
        } else {
            user = new User({
                username: username,
                lastJoined: new Date(),
                lastLeaved: new Date(),
            });
        }

        this.userRepository.create(user).then(() => {
            this.logger.info(`user ${user.username} has been created/updated`);
        }).catch(err => {
            this.logger.error(`failed to create/update user : ${err}`);
        });
    }

    onMessage (channel, userstate, message) {
        if (this.connectorManager === null) {
            return;
        }
        if (!message || (message.length > 0 && message[0] !== '!')) {
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
    }

    async write (commandResponse) {
        let message = `${commandResponse.message}`;
        // change "\n" in ", " because IRC does not interpret \n.
        message = message.replace(/\n/g, ', ');
        while (message.length > 0) {
            // split into 499char-parts because IRC maxlength message
            const subMessage = message.substr(0, 499);
            message = message.substr(499);

            // TODO : split into words if possible

            switch (commandResponse.destinationType) {
                case 'channel':
                    await this.client.say(commandResponse.recipient, subMessage).catch(err => {
                        this.logger.error(err);
                    });
                    break;
                case 'whisper':
                    await this.client.whisper(commandResponse.recipient, subMessage).catch(err => {
                        this.logger.error(err);
                    });
                    break;
            }
        }
    }
};
