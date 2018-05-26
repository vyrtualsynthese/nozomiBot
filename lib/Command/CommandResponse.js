module.exports = class CommandResponse {
    constructor (message, context = {}) {
        this.message = message;
        this.context = context;
    }
};
