const mongoose = require('mongoose');

module.exports = class DatabaseManager {
    constructor (logger) {
        this.logger = logger.child({subject: this.constructor.name});
        this.db = null;
    }

    async init () {
        if (!process.env.MONGO_HOST || !process.env.MONGO_PORT) {
            console.error(`[DatabaseManager] one of environment MONGO_* is not defined`);
            this.logger.error(`one of environment MONGO_* is not defined`);
            return;
        }

        console.log('connection to mongodb...');
        try {
            await mongoose.connect(`mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`);
            this.db = mongoose.connection;
            console.log('mongodb connected');
        } catch (err) {
            console.error(`[DatabaseManager] failed to connect to mongodb : ${err}`);
            this.logger.error(`failed to connect to mongodb : ${err}`);
        }
    }

    async stop () {
        if (this.db === null) {
            return;
        }
        try {
            await this.db.close();
            console.log('mongodb disconnected');
        } catch (err) {
            console.error(`[DatabaseManager] failed to disconnect to mongodb : ${err}`);
            this.logger.error(`failed to disconnect to mongodb : ${err}`);
        }
    }
};
