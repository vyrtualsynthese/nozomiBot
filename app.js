'use strict';

(async () => {
    require('dotenv').load();
    if (!process.env.NODE_ENV) { process.env.NODE_ENV = 'prod'; }

    const fs = require('fs');

    const logger = require('pino')({
        extreme: true
    }, fs.createWriteStream(`./var/log/${process.env.NODE_ENV}.log`, {'flags': 'a'}));

    const DatabaseManager = require('./lib/Database/DatabaseManager');
    const StandardConnectorIO = require("./lib/Connector/StandardConnectorIO");
    const ConnectorManager = require("./lib/Connector/ConnectorManager");
    const CommandHandler = require("./lib/Command/CommandHandler");
    const EchoCommand = require("./lib/Command/EchoCommand");
    const OnlyStandardCommand = require("./lib/Command/OnlyStandardCommand");
    const CreateStaticCommandCommand = require("./lib/Command/Commands/CreateStaticCommandCommand");
    const ListStaticCommandsCommand = require("./lib/Command/Commands/ListStaticCommandsCommand");
    const ListCommandsCommand = require("./lib/Command/Commands/ListCommandsCommand");
    const CommandsCommand = require("./lib/Command/Commands/CommandsCommand");
    const RandomCommand = require("./lib/Command/RandomCommand");
    const TwitchConnectorIO = require('./lib/Connector/TwitchConnectorIO');
    const StaticCommandRepository = require('./lib/Database/StaticCommandRepository');

    const dbManager = new DatabaseManager(logger);
    await dbManager.init();
    const staticCommandRepo = new StaticCommandRepository(dbManager);

    const connectorManager = new ConnectorManager();

    const scio = new StandardConnectorIO(process.env.EXIT_COMMAND, dbManager, logger);
    await scio.init();
    connectorManager.addConnector(scio);

    const tcio = new TwitchConnectorIO(logger);
    await tcio.init();
    connectorManager.addConnector(tcio);

    const commandHandler = new CommandHandler(connectorManager, staticCommandRepo, logger);
    commandHandler.registerCommand(new RandomCommand(logger));
    commandHandler.registerCommand(new EchoCommand(logger));
    commandHandler.registerCommand(new OnlyStandardCommand(logger));
    commandHandler.registerCommand(new ListStaticCommandsCommand(logger, staticCommandRepo));
    commandHandler.registerCommand(new ListCommandsCommand(logger, staticCommandRepo, commandHandler));
    commandHandler.registerCommand(new CreateStaticCommandCommand(logger, staticCommandRepo));
    commandHandler.registerCommand(new CommandsCommand(logger));

    console.log(`Nozomibot is running... command "${scio.exitCommand}" for quit.`);

    scio.displayPrompt();
})();
