"use strict";

require('dotenv').load();

const ConnectorIO = require("./lib/Connector/ConnectorIO");
const StandardConnectorOutput = require("./lib/Connector/StandardConnectorOutput");
const StandardConnectorInput = require("./lib/Connector/StandardConnectorInput");
const ConnectorManager = require("./lib/Connector/ConnectorManager");
const CommandHandler = require("./lib/CommandHandler");

const sci = new StandardConnectorInput();
const sco = new StandardConnectorOutput();

const connectorManager = new ConnectorManager();
connectorManager.addConnector(sci);

const commandHandler = new CommandHandler(connectorManager);
