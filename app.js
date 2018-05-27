'use strict';

require('dotenv').load();
if (!process.env.NODE_ENV)
    process.env.NODE_ENV = 'prod';

const fs = require('fs');

const pino = require('pino')({
    extreme: true
}, fs.createWriteStream(`./var/log/${process.env.NODE_ENV}.log`, {'flags': 'a'}));

const StandardConnectorIO = require("./lib/Connector/StandardConnectorIO");
const ConnectorManager = require("./lib/Connector/ConnectorManager");
const CommandHandler = require("./lib/Command/CommandHandler");
const EchoCommand = require("./lib/Command/EchoCommand");
const OnlyStandardCommand = require("./lib/Command/OnlyStandardCommand");
const TwitchConnectorIO = require('./lib/Connector/TwitchConnectorIO');

const exitCommand = 'exit';

const connectorManager = new ConnectorManager();
connectorManager.addConnector(new StandardConnectorIO(exitCommand, pino));
connectorManager.addConnector(new TwitchConnectorIO(pino));

const commandHandler = new CommandHandler(connectorManager);
commandHandler.registerCommand(new EchoCommand(pino));
commandHandler.registerCommand(new OnlyStandardCommand(pino));

console.log(`Nozomibot is running... command "${exitCommand}" for quit.`);
