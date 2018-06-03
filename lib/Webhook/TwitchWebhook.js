
const request = require('request');

module.exports = class TwitchWebhook {
    constructor (logger, server) {
        this.logger = logger.child({subject: this.constructor.name});
        this.server = server;
        this.twitchBaseUrl = 'https://api.twitch.tv/helix';
    }

    init () {
        if (!process.env.TWITCH_CHANNEL_ID || !process.env.TWITCH_WEBHOOK_SECRET) {
            console.error('[TwitchWebhook] TWITCH_CHANNEL_ID or TWITCH_WEBHOOK_SECRET is not defined');
            this.logger.error('TWITCH_CHANNEL_ID or TWITCH_WEBHOOK_SECRET is not defined');
            return;
        }

        this.server.addRoute('/twitch/streams', this._handleStreamWebhook);
        this._subscribeStream();
    }

    async _subscribeStream () {
        if (!process.env.WEBSERVER_BASE_URL || !process.env.TWITCH_WEBHOOK_STREAMS_CALLBACK_PATH) {
            console.error('[TwitchWebhook] WEBSERVER_BASE_URL or TWITCH_WEBHOOK_STREAMS_CALLBACK_PATH is not defined');
            this.logger.error('WEBSERVER_BASE_URL or TWITCH_WEBHOOK_STREAMS_CALLBACK_PATH is not defined');
            return;
        }
        // TODO : keep in database the date where subscribe. or CRON each 10 days to subscribe webhooks

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
                    'hub.lease_seconds': 10, // TODO : for prod : 864000
                },
            }, (err, response, body) => {
                if (err) {
                    console.error(err);
                    reject(new Error(err));
                    return;
                }
                if (body && body.error) {
                    console.error(`failed to subscribe to Twitch webhook : ${body.message}`);
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
    _handleStreamWebhook (url, request, response, body) {
        console.log('handle stream webhook', url, body);
        const hubMode = url.searchParams.get('hub.mode');
        const hubChallenge = url.searchParams.get('hub.challenge');
        if (hubMode === 'subscribe') {
            console.log('respond to the challenge subscription');
            response.statusCode = 200;
            return response.end(hubChallenge);
        }

        response.statusCode = 400;
        return response.end();
    }
};
