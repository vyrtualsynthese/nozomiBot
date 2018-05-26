module.exports = class CommandHandler {
    constructor (connectorManager) {
        this.commands = [];
        connectorManager.on('command', (command) => {
            this.handle(command);
        });
    }

    registerCommand (command) {
        this.commands.push(command);
    }

    handle (commandExchange) {
        commandExchange.connector.write(`Réponse : ${commandExchange.name}`);
        for (let command of this.commands) {
            if (!command.supports(commandExchange)) {
                continue;
            }
            command.handle(commandExchange);
        }
    }
}
