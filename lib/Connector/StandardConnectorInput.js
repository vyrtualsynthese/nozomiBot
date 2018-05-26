const readline = require('readline');
// const ConnectorInput = require('./ConnectorInput');

module.exports = class StandardConnectorInput {
    constructor() {
        this.connectorManager = null;
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

    setManager (manager) {
        this.connectorManager = manager;
    }
};
