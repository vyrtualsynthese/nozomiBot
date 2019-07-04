const request = require('request');
const TwitchClient = require('twitch').default;

module.exports = class TwitchAPIHandler {
    constructor (logger, cacheManager) {
        this.cacheManager = cacheManager;
        this.twitchClient = TwitchClient.withClientCredentials(`${process.env.TWITCH_CLIENT_ID}`, `${process.env.TWITCH_CLIENT_SECRET}`);
        this.twitchChannelName = process.env.TWITCH_CHANNEL.substring(1);
        this.logger = logger.child({ subject: this.constructor.name });
        this.cacheManager = cacheManager;
        this.apiBaseUrl = 'https://api.twitch.tv/helix';
        this.apiHeaders = {
            'Authorization': `Bearer ${process.env.TWITCH_CLIENT_SECRET}`,
            'Client-ID': `${process.env.TWITCH_CLIENT_ID}`,
        };
        this.apiKrakenBaseUrl = 'https://api.twitch.tv/kraken';
        this.apiKrakenHeaders = {
            'Accept': 'application/vnd.twitchtv.v5+json',
            'Authorization': `OAuth ${process.env.TWITCH_CLIENT_SECRET}`,
            'Client-ID': `${process.env.TWITCH_CLIENT_ID}`,
        };
    }

    async _fetch (url, headers = {}) {
        return new Promise((resolve, reject) => {
            request.get({
                uri: url,
                headers: headers,
            }, (err, response, body) => {
                if (err) {
                    reject(new Error(err));
                    return;
                }
                resolve(JSON.parse(body));
            });
        });
    }
    async getChannelId (channelName) {
        const resp = await this.twitchClient.helix.users.getUserByName(channelName);
        return resp._data.id;
    }

    // WIP
    async getUserInfoByUsername (username) {
        let userInfo = await this.cacheManager.getObject(`user_info_${username}`);
        if (userInfo === false) {
            return false;
        }
        userInfo = await this.twitchClient.helix.users.getUserByName(username);
        if (!userInfo) {
            this.cacheManager.setObject(`user_info_${username}`, false, 300);
            return false;
        }
        this.cacheManager.setObject(`user_info_${username}`, userInfo, 300);
        return userInfo;
    }

    async getUserInfoFollow (username) {
        let userFollowsInfo = await this.cacheManager.getObject(`user_info_follow_${username}`);
        if (userFollowsInfo === false) {
            return false;
        } else if (userFollowsInfo) {
            return userFollowsInfo;
        }
        let helixUser = await this.getUserInfoByUsername(username);
        if (helixUser === false) {
            return false;
        }
        console.log(this.twitchChannelId);
        const userInfoFollow = await helixUser.getFollowTo(this.twitchChannelId);
        if (!userInfoFollow) {
            this.cacheManager.setObject(`user_info_follow_${helixUser._data.display_name}`, false, 300);
            return false;
        }
        this.cacheManager.setObject(`user_info_follow_${helixUser._data.display_name}`, userInfoFollow, 300);
        return userInfoFollow;
    }

    async getUserInfo (userId) {
        let userInfo = await this.cacheManager.getObject(`user_info_${userId}`);
        if (!userInfo) {
            const body = await this._fetch(`${this.apiBaseUrl}/users?id=${userId}`, this.apiHeaders);
            if (body.data.length === 0) {
                throw new Error(`user ${userId} does not exist. ${JSON.stringify(body)}`);
            }

            userInfo = body.data[0];
            this.cacheManager.setObject(`user_info_${userId}`, userInfo, 300);
            this.cacheManager.setObject(`user_info_${userInfo.login}`, userInfo, 300);
        }

        return userInfo;
    }

    async getStreamInfo (noCache = false) {
        let streamInfo = null;
        if (!noCache) {
            streamInfo = await this.cacheManager.getObject(`stream_info_${this.twitchChannelId}`);
        }
        if (!streamInfo) {
            const helixStream = await this.twitchClient.helix.streams.getStreamByUserId(this.twitchChannelId);
            if (!helixStream) {
                throw new Error(`stream ${this.twitchChannelName} does not exist. ${JSON.stringify(helixStream)}`);
            }
            this.cacheManager.setObject(`stream_info_${this.twitchChannelId}`, streamInfo, 300); // 5min
        }

        return streamInfo;
    }

    // WIP
    async getGameInfo (gameId) {
        let gameInfo = await this.cacheManager.getObject(`game_info_${gameId}`);
        if (gameInfo === null) {
            const helixStream = await this.getStreamInfo(this.twitchChannelId, true);
            if (helixStream) {
                throw new Error(`game ${gameId} does not exist. ${JSON.stringify(body)}`);
            }

            gameInfo = body.data[0];
            this.cacheManager.setObject(`game_info_${gameId}`, gameInfo, 3600); // 60min
        }

        return gameInfo;
    }

    async getChatters () {
        let chatters = await this.cacheManager.getObject('chatters');
        if (!chatters) {
            const body = await this._fetch(`https://tmi.twitch.tv/group/user/${this.twitchChannelName}/chatters`);
            if (!body.chatters) {
                throw new Error(`chatters do not exist. ${JSON.stringify(body)}`);
            }

            chatters = body.chatters;
            this.cacheManager.setObject('chatters', chatters, 60); // 1min
        }

        return chatters;
    }
};
