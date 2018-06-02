const ConnectorIO = require('./ConnectorIO');
const CommandExchange = require('../Command/CommandExchange');
const User = require('../Database/Model/User');
const tmi = require('tmi.js');
const moment = require('moment');

module.exports = class TwitchConnectorIO extends ConnectorIO {
    constructor (logger, cacheManager, userRepository) {
        super();

        this.apiBaseUrl = 'https://api.twitch.tv/helix';
        this.client = null;
        this.logger = logger.child({subject: 'TwitchConnectorIO'});
        this.cacheManager = cacheManager;
        this.userRepository = userRepository;
        this.apiHeaders = {
            'Authorization': `Bearer ${process.env.TWITCH_CLIENT_SECRET}`,
            'Client-ID': `${process.env.TWITCH_CLIENT_ID}`
        };
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

    async _fetch (url) {
        return new Promise((resolve, reject) => {
            this.client.api({
                url: url,
                method: 'GET',
                headers: this.apiHeaders
            }, (err, res, body) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(body);
            });
        });
    }

    async getUserInfoByUsername (username) {
        let userInfo = await this.cacheManager.getObject(`user_info_${username}`);
        if (!userInfo) {
            const body = await this._fetch(`${this.apiBaseUrl}/users?login=${username}`);
            if (body.data.length === 0) {
                throw new Error(`stream ${process.env.TWITCH_CHANNEL_ID} does not exist`);
            }

            userInfo = body.data[0];
            this.cacheManager.setObject(`user_info_${username}`, userInfo, 300);
            this.cacheManager.setObject(`user_info_${userInfo.id}`, userInfo, 300);
        }

        return userInfo;
    }

    async getUserInfo (userId) {
        let userInfo = await this.cacheManager.getObject(`user_info_${userId}`);
        if (!userInfo) {
            const body = await this._fetch(`${this.apiBaseUrl}/users?id=${userId}`);
            if (body.data.length === 0) {
                throw new Error(`stream ${process.env.TWITCH_CHANNEL_ID} does not exist`);
            }

            userInfo = body.data[0];
            this.cacheManager.setObject(`user_info_${userId}`, userInfo, 300);
            this.cacheManager.setObject(`user_info_${userInfo.login}`, userInfo, 300);
        }

        return userInfo;
    }

    async getStreamInfo (userId) {
        let streamInfo = await this.cacheManager.getObject(`stream_info_${userId}`);
        if (!streamInfo) {
            const body = await this._fetch(`${this.apiBaseUrl}/streams?user_id=${userId}`);
            if (body.data.length === 0) {
                throw new Error(`stream ${process.env.TWITCH_CHANNEL_ID} does not exist`);
            }

            streamInfo = body.data[0];
            this.cacheManager.setObject(`stream_info_${userId}`, streamInfo, 300); // 5min
        }

        return streamInfo;
    }

    async getGameInfo (gameId) {
        let gameInfo = await this.cacheManager.getObject(`game_info_${gameId}`);
        if (!gameInfo) {
            const body = await this._fetch(`${this.apiBaseUrl}/games?id=${gameId}`);
            if (body.data.length === 0) {
                throw new Error(`game ${gameId} does not exist`);
            }

            gameInfo = body.data[0];
            this.cacheManager.setObject(`game_info_${gameId}`, gameInfo, 3600); // 60min
        }

        return gameInfo;
    }

    async write (commandResponse) {
        let message = `${commandResponse.message}`;
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
