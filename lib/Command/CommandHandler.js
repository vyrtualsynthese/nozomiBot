module.exports = class CommandHandler {
    constructor (connectorManager) {
        this.commands = [];
        connectorManager.on('command', (commandExchange) => {
            this.handle(commandExchange);
        });
    }

    registerCommand (command) {
        this.commands.push(command);
    }

    handle (commandExchange) {
        for (let command of this.commands) {
            if (!command.supports(commandExchange)) {
                continue;
            }
            command.handle(commandExchange);
        }
    }
};
