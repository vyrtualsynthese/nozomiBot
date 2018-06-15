const StreamInfo = require('../Database/Model/StreamInfo');
const CommandResponse = require('../Command/CommandResponse');
const request = require('request');

module.exports = class TwitchWebhook {
    /**
     * @param logger
     * @param {WebhookServer} server
     * @param {CacheManager} cacheManager
     * @param {StreamInfoRepository} streamInfoRepository
     * @param {TwitchConnectorIO} twitchConnector
     */
    constructor (logger, server, cacheManager, streamInfoRepository, twitchConnector, twitchApiHandler) {
        this.logger = logger.child({subject: this.constructor.name});
        this.server = server;
        this.cacheManager = cacheManager;
        this.streamInfoRepository = streamInfoRepository;
        this.twitchConnector = twitchConnector;
        this.twitchApiHandler = twitchApiHandler;
        this.twitchBaseUrl = 'https://api.twitch.tv/helix';
    }

    init () {
        if (!process.env.TWITCH_CHANNEL_ID || !process.env.TWITCH_WEBHOOK_SECRET || !process.env.WEBSERVER_BASE_URL) {
            console.error('[TwitchWebhook] TWITCH_CHANNEL_ID, TWITCH_WEBHOOK_SECRET or WEBSERVER_BASE_URL is not defined');
            this.logger.error('TWITCH_CHANNEL_ID, TWITCH_WEBHOOK_SECRET or WEBSERVER_BASE_URL is not defined');
            return;
        }

        this.server.addRoute('/twitch/streams', (url, request, response, body) => {
            return this._handleStreamWebhook(url, request, response, body);
        });
        this.server.addRoute('/twitch/follows', (url, request, response, body) => {
            return this._handleFollowsWebhook(url, request, response, body);
        });
        this._subscribeStream().catch(err => {
            console.error(`failed to subscribe to Twitch webhook : ${err}`);
        });
    }

    async _subscribe (topic, callback) {
        // TODO : to resubscribe : keep in database the date where subscribe. or CRON each 10 days to subscribe webhooks. or setInterval()

        return new Promise((resolve, reject) => {
            console.log(`Subscribe to the Twitch webhook ${topic}...`);
            request.post({
                uri: `${this.twitchBaseUrl}/webhooks/hub`,
                headers: {
                    'Client-ID': process.env.TWITCH_CLIENT_ID,
                    'Content-Type': 'application/json',
                },
                json: {
                    'hub.callback': callback,
                    'hub.mode': 'subscribe',
                    'hub.topic': topic,
                    'hub.secret': process.env.TWITCH_WEBHOOK_SECRET,
                    'hub.lease_seconds': 3600, // TODO : for prod : 864000
                },
            }, (err, response, body) => {
                if (err) {
                    reject(new Error(err));
                    return;
                }
                if (body && body.error) {
                    reject(new Error(body.message));
                    return;
                }
                console.log(`The Twitch webhook ${topic} has been subscribed`);
                resolve();
                /*
                headers ratelimit
                'ratelimit-limit': '30',
                'ratelimit-remaining': '29',
                'ratelimit-reset': '1527968920',
                */
            });
        });
    }

    async _subscribeStream () {
        this._subscribe(`${this.twitchBaseUrl}/streams?user_id=${process.env.TWITCH_CHANNEL_ID}`, `${process.env.WEBSERVER_BASE_URL}/twitch/streams`).catch(err => {
            this.logger.error(err);
        });
        this._subscribe(`${this.twitchBaseUrl}/users/follows?first=1&to_id=${process.env.TWITCH_CHANNEL_ID}`, `${process.env.WEBSERVER_BASE_URL}/twitch/follows`).catch(err => {
            this.logger.error(err);
        });
    }

    _respondToChallengeSubscription (url, response) {
        const hubMode = url.searchParams.get('hub.mode');
        const hubChallenge = url.searchParams.get('hub.challenge');
        const topic = url.searchParams.get('hub.topic');
        if (hubMode === 'subscribe') {
            console.log(`respond to the challenge subscription ${topic}`);
            response.statusCode = 200;
            response.end(hubChallenge);
            return true;
        }

        return false;
    }

    /**
     * @param {URL} url
     * @param request
     * @param response
     * @param body
     * @private
     */
    async _handleFollowsWebhook (url, request, response, body) {
        if (this._respondToChallengeSubscription(url, response)) {
            return;
        }

        if (body.data && body.data.length > 0) {
            // const followedAt = moment(body.data[0].followed_at);
            const userId = body.data[0].from_id;
            const user = await this.twitchApiHandler.getUserInfo(userId);

            // TODO : register in database

            this.twitchConnector.write(new CommandResponse(
                `${user.display_name} a follow la chaîne.`,
                'channel',
                process.env.TWITCH_CHANNEL,
                {}
            ));

            response.statusCode = 200;
            return response.end();
        }

        response.statusCode = 400;
        return response.end();
    }

    /**
     * @param {URL} url
     * @param request
     * @param response
     * @param body
     * @private
     */
    async _handleStreamWebhook (url, request, response, body) {
        if (this._respondToChallengeSubscription(url, response)) {
            return;
        }

        if (body.data) {
            if (body.data.length === 0) {
                // offline
                this.logger.info('stream is now offline');

                let streamInfoEntity = await this.streamInfoRepository.findOneByChannelId(process.env.TWITCH_CHANNEL_ID);
                if (!streamInfoEntity) {
                    streamInfoEntity = new StreamInfo({
                        channelId: process.env.TWITCH_CHANNEL_ID,
                    });
                }
                streamInfoEntity.endedAt = new Date();
                this.streamInfoRepository.create(streamInfoEntity).catch(err => {
                    this.logger.error(`fail to create/update the stream info ${streamInfoEntity.channelId} : ${err}`);
                });
            } else {
                // online
                this.logger.info('stream is now online');
                const streamInfo = body.data[0];

                let streamInfoEntity = await this.streamInfoRepository.findOneByChannelId(streamInfo.user_id);
                if (!streamInfoEntity) {
                    streamInfoEntity = new StreamInfo({
                        channelId: streamInfo.user_id,
                    });
                }
                streamInfoEntity.startedAt = new Date(streamInfo.started_at);
                this.streamInfoRepository.create(streamInfoEntity).catch(err => {
                    this.logger.error(`fail to create/update the stream info ${streamInfo.user_id} : ${err}`);
                });
                this.cacheManager.setObject(`stream_info_${streamInfo.user_id}`, streamInfo, 300);
            }
            response.statusCode = 200;
            return response.end();
        }

        response.statusCode = 400;
        return response.end();
    }
};
