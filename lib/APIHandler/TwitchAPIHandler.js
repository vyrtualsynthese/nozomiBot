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

    // WIP
    async getUserInfoByUsername (username, cache = 'no-cache') {
        let userInfo = await this.cacheManager.getObject(`user_info_${username}`);
        if (userInfo === false) {
            return false;
        } else if (!userInfo || cache === 'no-cache') {
            userInfo = await this.twitchClient.helix.users.getUserByName(username);
            if (!userInfo) {
                this.cacheManager.setObject(`user_info_${username}`, false, 300);
                return false;
            }
            this.cacheManager.setObject(`user_info_${username}`, userInfo, 300);
        }
        return userInfo;
    }

    async getUserInfoFollow (username) {
        let userFollowsInfo = await this.cacheManager.getObject(`user_info_follow_${username}`);
        if (userFollowsInfo === false) {
            return false;
        } else if (userFollowsInfo) {
            return userFollowsInfo;
        }

        let helixUser = await this.getUserInfoByUsername(username, 'no-cache');
        if (helixUser === false) {
            return false;
        }

        let channelInfo = await this.cacheManager.getObject(`channel_info_${this.twitchChannelName}`);

        if (!channelInfo) {
            channelInfo = await this.getUserInfoByUsername(this.twitchChannelName);
            this.cacheManager.setObject(`channel_info_${this.twitchChannelName}`, channelInfo, 3600);
        }

        const userInfoFollow = await helixUser.getFollowTo(channelInfo._data.id);
        if (!userInfoFollow) {
            this.cacheManager.setObject(`user_info_follow_${helixUser._data.display_name}`, false, 300);
            return false;
        }
        this.cacheManager.setObject(`user_info_follow_${helixUser._data.display_name}`, userInfoFollow, 300);
        return userInfoFollow;
    }

    async getStreamInfo (cache = 'no-cache') {
        let streamInfo = await this.cacheManager.getObject(`stream_info`);
        if (streamInfo === false) {
            return false;
        } else if (cache === 'no-cache' || !streamInfo) {
            streamInfo = await this.twitchClient.helix.streams.getStreamByUserName(this.twitchChannelName);
            if (!streamInfo) {
                this.cacheManager.setObject(`stream_info`, false, 300);
                return false;
            }
            this.cacheManager.setObject(`stream_info`, streamInfo, 300);
        }
        return streamInfo;
    }

    async getGameInfo () {
        let streamGameInfo = await this.cacheManager.getObject(`stream_game_info`);
        if (streamGameInfo === false) {
            return false;
        } else if (streamGameInfo) {
            return streamGameInfo;
        }

        let streamInfo = await this.getStreamInfo('no-cache');
        if (!streamInfo) {
            return false;
        }
        streamGameInfo = await streamInfo.getGame();
        this.cacheManager.setObject(`stream_game_info`, streamGameInfo, 300);

        return streamGameInfo;
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
