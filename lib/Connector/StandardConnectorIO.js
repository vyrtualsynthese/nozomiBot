const readline = require('readline');
const ConnectorIO = require('./ConnectorIO');
const CommandExchange = require('../Command/CommandExchange');
const DatabaseManager = require('../Database/DatabaseManager');
const CacheManager = require('../CacheManager');
const WebhookServer = require('../Webhook/WebhookServer');

module.exports = class StandardConnectorIO extends ConnectorIO {
    constructor (exitCommand, dbManager, cacheManager, webhookServer, logger) {
        super();

        if (!(exitCommand === 'exit' || exitCommand === undefined) || !(dbManager instanceof DatabaseManager) || !(cacheManager instanceof CacheManager) || !(webhookServer instanceof WebhookServer)) {
            throw new Error();
        }

        this.exitCommand = exitCommand || 'exit';
        this.dbManager = dbManager;
        this.cacheManager = cacheManager;
        this.webhookServer = webhookServer;
        this.logger = logger.child({subject: 'StandardConnectorIO'});
        this.rl = readline;
    }

    async init () {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.rl.setPrompt('> ');
        this.rl.on('line', (input) => {
            if (input === this.exitCommand) {
                this._exit();
                return;
            }
            if (this.connectorManager === null) {
                return;
            }
            if (!input) {
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
                this.displayPrompt();
            });
        });
        process.on('SIGTERM', () => {
            this._exit();
        });
    }

    displayPrompt () {
        this.rl.prompt();
    }
    write (commandResponse) {
        console.log(commandResponse.message);
        this.displayPrompt();
    }
    async _exit () {
        console.log('Nozomibot shutdowns...');
        this.rl.close();
        await this.dbManager.stop();
        await this.cacheManager.stop();
        await this.webhookServer.stop();
        process.exit();
    }
};
