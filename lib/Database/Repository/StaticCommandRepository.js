const StaticCommand = require('../Model/StaticCommand');

module.exports = class StaticCommandRepository {
    async findOneByName (name) {
        return StaticCommand.findOne({ 'name': name });
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

    async remove (entity) {
        return new Promise((resolve, reject) => {
            entity.remove((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    async findAll () {
        return StaticCommand.find();
    }
};
