const GameChange = require('../Database/Model/GameChange');
const moment = require('moment');

/**
 * Request the Twitch API every X seconds to detect game change
 * @type {module.TwitchRefreshStreamInfoScheduler}
 */
module.exports = class TwitchRefreshStreamInfoScheduler {
    constructor (logger, twitchAPIHandler, gameChangeRepo) {
        this.logger = logger.child({subject: this.constructor.name});
        this.interval = null;
        this.twitchAPIHandler = twitchAPIHandler;
        this.gameChangeRepo = gameChangeRepo;

        // TODO : extends from EventEmitter and emit('game_change') ?

        this.lastGameChange = null;
    }

    async init () {
        this.lastGameChange = await this.gameChangeRepo.findLast();
        if (!this.lastGameChange) {
            this.lastGameChange = new GameChange({
                gameId: null,
                seeAt: new Date(),
            });
            await this.gameChangeRepo.create(this.lastGameChange);
        }
        this.resetDatetime = null;

        this._refresh();
        this.interval = setInterval(() => {
            this._refresh();
        }, parseInt(process.env.TWITCH_REFRESH_STREAM_INFO_SCHEDULE_DELAY) * 1000);
    }

    stop () {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    async _refresh () {
        const streamInfo = await this.twitchAPIHandler.getStreamInfo(process.env.TWITCH_CHANNEL_ID, true).catch(_ => {});
        if (!streamInfo || !streamInfo.game_id) {
            if (this.lastGameChange.gameId === null) {
                return;
            }
            if (this.resetDatetime === null) {
                this.resetDatetime = new Date();
            }
            const elapsedSeconds = moment(new Date()).diff(this.resetDatetime, 'seconds');
            if (elapsedSeconds >= process.env.TWITCH_RESET_STREAM_INFO_SCHEDULE) {
                this.lastGameChange = new GameChange({
                    gameId: null,
                    seeAt: new Date(),
                });
                this.gameChangeRepo.create(this.lastGameChange);
                this.resetDatetime = null;
            }
            return;
        }

        const gameId = streamInfo.game_id;
        if (this.lastGameChange.gameId !== gameId) {
            this.lastGameChange = new GameChange({
                gameId: gameId,
                seeAt: new Date(),
            });
            this.gameChangeRepo.create(this.lastGameChange);
        }
    }
};
