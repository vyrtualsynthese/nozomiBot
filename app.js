'use strict';

(async () => {

require('dotenv').load();
if (!process.env.NODE_ENV)
    process.env.NODE_ENV = 'prod';

const fs = require('fs');

const pino = require('pino')({
    extreme: true
}, fs.createWriteStream(`./var/log/${process.env.NODE_ENV}.log`, {'flags': 'a'}));

const DatabaseManager = require('./lib/Database/DatabaseManager');
const StandardConnectorIO = require("./lib/Connector/StandardConnectorIO");
const ConnectorManager = require("./lib/Connector/ConnectorManager");
const CommandHandler = require("./lib/Command/CommandHandler");
const EchoCommand = require("./lib/Command/EchoCommand");
const OnlyStandardCommand = require("./lib/Command/OnlyStandardCommand");
const TwitchConnectorIO = require('./lib/Connector/TwitchConnectorIO');
const StaticCommandRepository = require('./lib/Database/StaticCommandRepository');


const dbManager = new DatabaseManager(pino);
await dbManager.init();
const staticCommandRepo = new StaticCommandRepository(dbManager);

const connectorManager = new ConnectorManager();

const scio = new StandardConnectorIO(process.env.EXIT_COMMAND, dbManager, pino);
await scio.init();
connectorManager.addConnector(scio);

const tcio = new TwitchConnectorIO(pino);
await tcio.init();
connectorManager.addConnector(tcio);

const commandHandler = new CommandHandler(connectorManager);
commandHandler.registerCommand(new EchoCommand(pino));
commandHandler.registerCommand(new OnlyStandardCommand(pino));

console.log(`Nozomibot is running... command "${scio.exitCommand}" for quit.`);

scio.displayPrompt();

})();
