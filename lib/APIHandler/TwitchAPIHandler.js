const request = require('request');

module.exports = class TwitchAPIHandler {
    constructor (logger, cacheManager) {
        this.logger = logger.child({subject: this.constructor.name});
        this.cacheManager = cacheManager;
        this.apiBaseUrl = 'https://api.twitch.tv/helix';
        this.apiHeaders = {
            'Authorization': `Bearer ${process.env.TWITCH_CLIENT_SECRET}`,
            'Client-ID': `${process.env.TWITCH_CLIENT_ID}`
        };
    }

    async _fetch (url) {
        return new Promise((resolve, reject) => {
            request.get({
                uri: url,
                headers: this.apiHeaders,
            }, (err, response, body) => {
                if (err) {
                    reject(new Error(err));
                    return;
                }
                resolve(JSON.parse(body));
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

    async getStreamInfo (userId, noCache = false) {
        let streamInfo = null;
        if (!noCache) {
            streamInfo = await this.cacheManager.getObject(`stream_info_${userId}`);
        }
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

    async getChatters () {
        let chatters = await this.cacheManager.getObject('chatters');
        if (!chatters) {
            const body = await this._fetch(`https://tmi.twitch.tv/group/user/${process.env.TWITCH_CHANNEL.substr(1)}/chatters`);
            if (!body.chatters) {
                throw new Error(`chatters do not exist`);
            }

            chatters = body.chatters;
            this.cacheManager.setObject('chatters', chatters, 60); // 1min
        }

        return chatters;
    }
};
