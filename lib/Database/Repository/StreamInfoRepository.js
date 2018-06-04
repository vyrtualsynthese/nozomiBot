const StreamInfo = require('../Model/StreamInfo');

module.exports = class StreamInfoRepository {
    constructor (dbManager) {
        this.dbManager = dbManager;
    }

    async findOneByChannelId (channelId) {
        return StreamInfo.findOne({ 'channelId': channelId });
    }

    async create (entity) {
        return new Promise((resolve, reject) => {
            entity.save((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    async findAll () {
        return StreamInfo.find();
    }
};
