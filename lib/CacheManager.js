const redis = require('redis');
const {promisify} = require('util');

module.exports = class CacheManager {
    constructor (logger) {
        this.logger = logger.child({subject: this.constructor.name});
    }

    async init () {
        if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
            console.error('[CacheManager] one of environment REDIS_* is not defined');
            this.logger.error(`one of environment REDIS_* is not defined`);
            return;
        }
        return new Promise((resolve, reject) => {
            console.log('connection to redis...');
            this.client = redis.createClient({
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
            });
            this.client.on('error', err => {
                this.logger.error(err);
                reject(err);
            });
            this.client.on('ready', () => {
                console.log('redis connected');
                resolve();
            });
        });
    }

    setObject (key, obj, expireSeconds = null) {
        this.client.set(key, JSON.stringify(obj), (err, res) => {
            if (err) {
                this.logger.error(err);
                return;
            }
            this.logger.info(`set ${key} for ${expireSeconds} seconds`);
        });
        if (expireSeconds) {
            this.client.expire(key, expireSeconds);
        }
    }

    async getObject (key) {
        // see https://github.com/NodeRedis/node_redis#promises
        const result = await promisify(this.client.get).bind(this.client)(key);
        if (result) {
            return JSON.parse(result);
        }
        return result;
    }

    stop () {
        this.client.end(true);
    }
};
