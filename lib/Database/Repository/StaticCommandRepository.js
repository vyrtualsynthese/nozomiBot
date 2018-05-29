const StaticCommand = require('../Model/StaticCommand');

module.exports = class StaticCommandRepository {
    constructor (dbManager) {
        this.dbManager = dbManager;
    }

    async findOneByName (name) {
        return StaticCommand.findOne({ 'name': name });
    }

    async create (staticCommand) {
        return new Promise((resolve, reject) => {
            staticCommand.save((err) => {
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
