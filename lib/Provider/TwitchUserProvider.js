const AbstractUserProvider = require('./AbstractUserProvider');
const UserDTO = require('../DTO/User');

/**
 * @type {module.TwitchUserProvider}
 */
module.exports = class TwitchUserProvider extends AbstractUserProvider {
    constructor (logger, twitchAPIHandler) {
        super(logger);
        this.twitchAPIHandler = twitchAPIHandler;
    }

    async retrieveUser (username) {
        const user = await this.twitchAPIHandler.getUserInfoByUsername(username).catch(err => {
            this.logger.error(err);
        });
        if (user === null) {
            return null;
        }

        return new UserDTO(user.id, user.display_name);
    }
};
