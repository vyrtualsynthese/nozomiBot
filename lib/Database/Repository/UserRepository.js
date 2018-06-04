const User = require('../Model/User');

module.exports = class UserRepository {
    constructor (dbManager) {
        this.dbManager = dbManager;
    }

    async findOneByUsername (username) {
        return User.findOne({ 'username': username });
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
        return User.find();
    }
};
