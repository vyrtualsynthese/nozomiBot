const Parameters = require('../Model/Parameters');

module.exports = class ParametersRepository {
    async retrieve () {
        let parameters = await Parameters.findOne();
        if (!parameters) {
            parameters = new Parameters();
            await this._create(parameters);
        }

        return parameters;
    }

    async update (entity) {
        return this._create(entity);
    }

    async _create (entity) {
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
};
