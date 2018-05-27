const readline = require('readline');
const ConnectorIO = require('./ConnectorIO');
const CommandExchange = require('../Command/CommandExchange');

module.exports = class StandardConnectorIO extends ConnectorIO {
    constructor (exitCommand, logger) {
        super();

        this.logger = logger.child({subject: 'StandardConnectorIO'});
        this._init(exitCommand);
    }
    _init (exitCommand) {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.rl.setPrompt('> ');
        this.rl.on('line', (input) => {
            if (input === exitCommand) {
                this._exit();
                return;
            }
            if (this.connectorManager === null) {
                return;
            }
            const commandParsed = StandardConnectorIO.parseCommand(input);
            this.connectorManager.newCommand(
                new CommandExchange(commandParsed.commandName, commandParsed.args, this)
            );
        });
        this.rl.on('SIGINT', () => {
            this.rl.question('Are you sure you want to exit? (y|n) ', (answer) => {
                if (answer.match(/^y(es)?$/i)) {
                    this._exit();
                    return;
                }
                this.rl.prompt();
            });
        });
    }
    write (commandResponse) {
        console.log(commandResponse.message);
        this.rl.prompt();
    }
    _exit () {
        console.log('Nozomibot shutdowns...');
        this.rl.close();
    }
};
