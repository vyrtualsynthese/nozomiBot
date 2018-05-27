module.exports = class CommandExchange {
    constructor (name, args, connector, sourceType = null, recipient = null, context = {}) {
        this.name = name;
        this.args = args;
        this.connector = connector;
        this.sourceType = sourceType;
        this.recipient = recipient;
        this.context = context;
    }
};
