module.exports = class StaticCommandRepository {
    constructor (dbManager) {
        this.dbManager = dbManager;
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
};
