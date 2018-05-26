'use strict';

require('dotenv').load();

const StandardConnectorIO = require("./lib/Connector/StandardConnectorIO");
const ConnectorManager = require("./lib/Connector/ConnectorManager");
const CommandHandler = require("./lib/Command/CommandHandler");
const EchoCommand = require("./lib/Command/EchoCommand");
const TwitchConnectorIO = require('./lib/Connector/TwitchConnectorIO');

const connectorManager = new ConnectorManager();
connectorManager.addConnector(new StandardConnectorIO());
connectorManager.addConnector(new TwitchConnectorIO());

const commandHandler = new CommandHandler(connectorManager);
commandHandler.registerCommand(new EchoCommand());
