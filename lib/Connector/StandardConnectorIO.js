const readline = require('readline');
const ConnectorIO = require('./ConnectorIO');

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
            this.connectorManager.newCommand(this.parseCommand(input));
        });
    }
    write (commandResponse) {
        console.log(commandResponse.message);
    }
};
