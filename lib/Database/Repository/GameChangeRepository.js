const GameChange = require('../Model/GameChange');

module.exports = class GameChangeRepository {
    async findLast () {
        return GameChange.findOne().sort({seeAt: 'desc'});
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
        return GameChange.find();
    }
};
