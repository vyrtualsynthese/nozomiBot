module.exports = class CommandExchange {
    constructor (name, args, connector, context = {}) {
        this.name = name;
        this.args = args;
        this.connector = connector;
        this.context = context;
    }
};
