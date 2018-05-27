const readline = require('readline');
const ConnectorIO = require('./ConnectorIO');
const CommandExchange = require('../Command/CommandExchange');

module.exports = class StandardConnectorIO extends ConnectorIO {
    constructor(connectorManager = null) {
        super(connectorManager);

        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.rl.on('line', (input) => {
            if (input === 'exit') {
                this.rl.close();
                return;
            }
            if (this.connectorManager === null) {
                return;
            }
            const splitted = input.split(' ');
            let commandName = splitted.shift();
            if (commandName[0] === '!') {
                commandName = commandName.substr(1);
            }
            this.connectorManager.newCommand(new CommandExchange(commandName, splitted, this));
        });
    }
    write (commandResponse) {
        console.log(commandResponse.message);
    }
};
