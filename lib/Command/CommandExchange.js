module.exports = class CommandExchange {
    constructor (name, args, connector, sourceType, recipient, context = {}) {
        this.name = name;
        this.args = args;
        this.connector = connector;
        this.context = context;
        this.sourceType = sourceType;
        this.recipient = recipient;
    }
};
