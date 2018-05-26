"use strict";

require('dotenv').load();

const ConnectorIO = require("./lib/Connector/ConnectorIO");
const StandardConnectorIO = require("./lib/Connector/StandardConnectorIO");
const ConnectorManager = require("./lib/Connector/ConnectorManager");
const CommandHandler = require("./lib/CommandHandler");

const connectorManager = new ConnectorManager();
connectorManager.addConnector(new StandardConnectorIO());

const commandHandler = new CommandHandler(connectorManager);
