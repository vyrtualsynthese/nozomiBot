/**
 * @type {module.AbstractUserProvider}
 * @abstract
 */
module.exports = class AbstractUserProvider {
    constructor (logger) {
        this.logger = logger.child({subject: this.constructor.name});
    }

    /**
     * @return {UserDTO}
     * @abstract
     */
    async retrieveUser (username) {}
};
