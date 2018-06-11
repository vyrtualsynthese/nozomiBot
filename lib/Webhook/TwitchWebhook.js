const request = require('request');
const StreamInfo = require('../Database/Model/StreamInfo');

module.exports = class TwitchWebhook {
    constructor (logger, server, cacheManager, streamInfoRepository) {
        this.logger = logger.child({subject: this.constructor.name});
        this.server = server;
        this.cacheManager = cacheManager;
        this.streamInfoRepository = streamInfoRepository;
        this.twitchBaseUrl = 'https://api.twitch.tv/helix';
    }

    init () {
        if (!process.env.TWITCH_CHANNEL_ID || !process.env.TWITCH_WEBHOOK_SECRET) {
            console.error('[TwitchWebhook] TWITCH_CHANNEL_ID or TWITCH_WEBHOOK_SECRET is not defined');
            this.logger.error('TWITCH_CHANNEL_ID or TWITCH_WEBHOOK_SECRET is not defined');
            return;
        }

        this.server.addRoute('/twitch/streams', (url, request, response, body) => {
            return this._handleStreamWebhook(url, request, response, body);
        });
        this._subscribeStream().catch(err => {
            console.error(`failed to subscribe to Twitch webhook : ${err}`);
        });
    }

    async _subscribeStream () {
        if (!process.env.WEBSERVER_BASE_URL || !process.env.TWITCH_WEBHOOK_STREAMS_CALLBACK_PATH) {
            console.error('[TwitchWebhook] WEBSERVER_BASE_URL or TWITCH_WEBHOOK_STREAMS_CALLBACK_PATH is not defined');
            this.logger.error('WEBSERVER_BASE_URL or TWITCH_WEBHOOK_STREAMS_CALLBACK_PATH is not defined');
            return;
        }
        // TODO : to resubscribe : keep in database the date where subscribe. or CRON each 10 days to subscribe webhooks. or setInterval()

        return new Promise((resolve, reject) => {
            request.post({
                uri: `${this.twitchBaseUrl}/webhooks/hub`,
                headers: {
                    'Client-ID': process.env.TWITCH_CLIENT_ID,
                    'Content-Type': 'application/json',
                },
                json: {
                    'hub.callback': process.env.WEBSERVER_BASE_URL + process.env.TWITCH_WEBHOOK_STREAMS_CALLBACK_PATH,
                    'hub.mode': 'subscribe',
                    'hub.topic': `${this.twitchBaseUrl}/streams?user_id=${process.env.TWITCH_CHANNEL_ID}`,
                    'hub.secret': process.env.TWITCH_WEBHOOK_SECRET,
                    'hub.lease_seconds': 3600, // TODO : for prod : 864000
                },
            }, (err, response, body) => {
                if (err) {
                    console.error(err);
                    reject(new Error(err));
                    return;
                }
                if (body && body.error) {
                    reject(new Error(body.message));
                    return;
                }
                console.log('Twitch webhook streams has been subscribed');
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

    /**
     * @param {URL} url
     * @param request
     * @param response
     * @param body
     * @private
     */
    async _handleStreamWebhook (url, request, response, body) {
        const hubMode = url.searchParams.get('hub.mode');
        const hubChallenge = url.searchParams.get('hub.challenge');
        if (hubMode === 'subscribe') {
            console.log('respond to the challenge subscription');
            response.statusCode = 200;
            return response.end(hubChallenge);
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
