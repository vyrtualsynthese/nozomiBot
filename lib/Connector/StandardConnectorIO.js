const readline = require('readline');
const ConnectorInputIO = require('./ConnectorInputIO');

module.exports = class StandardConnectorIO extends ConnectorInputIO {
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
            this.connectorManager.newCommand({
                name: input,
                source: this,
            });
        });
    }
};
