module.exports = class CommandResponse {
    /**
     * @param {string} message
     * @param {string} destinationType channel|whisper
     * @param {string} recipient the name of the message's target
     * @param {Object} context
     */
    constructor (message, destinationType, recipient, context = {}) {
        this.message = message;
        this.context = context;
        this.destinationType = destinationType;
        this.recipient = recipient;
    }
};
