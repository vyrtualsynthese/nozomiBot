'use strict';

require('dotenv').load();

const StandardConnectorIO = require('./lib/Connector/StandardConnectorIO');
const ConnectorManager = require('./lib/Connector/ConnectorManager');
const TwitchConnectorIO = require('./lib/Connector/TwitchConnectorIO');
const CommandHandler = require('./lib/CommandHandler');

const connectorManager = new ConnectorManager();
connectorManager.addConnector(new StandardConnectorIO());
connectorManager.addConnector(new TwitchConnectorIO());

const commandHandler = new CommandHandler(connectorManager);
