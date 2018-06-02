'use strict';

(async () => {
    require('dotenv').load();
    if (!process.env.NODE_ENV) { process.env.NODE_ENV = 'prod'; }

    const fs = require('fs');

    const logger = require('pino')({
        extreme: false
    }, fs.createWriteStream(`./var/log/${process.env.NODE_ENV}.log`, {'flags': 'a'}));

    const DatabaseManager = require('./lib/Database/DatabaseManager');
    const CacheManager = require('./lib/CacheManager');
    const StandardConnectorIO = require('./lib/Connector/StandardConnectorIO');
    const ConnectorManager = require('./lib/Connector/ConnectorManager');
    const CommandHandler = require('./lib/Command/CommandHandler');
    const EchoCommand = require('./lib/Command/EchoCommand');
    const CreateStaticCommandCommand = require('./lib/Command/Commands/CreateStaticCommandCommand');
    const ListStaticCommandsCommand = require('./lib/Command/Commands/ListStaticCommandsCommand');
    const ListCommandsCommand = require('./lib/Command/Commands/ListCommandsCommand');
    const CommandsCommand = require('./lib/Command/Commands/CommandsCommand');
    const RandomCommand = require('./lib/Command/RandomCommand');
    const TitleCommand = require('./lib/Command/TitleCommand');
    const GameCommand = require('./lib/Command/GameCommand');
    const TwitchConnectorIO = require('./lib/Connector/TwitchConnectorIO');
    const StaticCommandRepository = require('./lib/Database/Repository/StaticCommandRepository');

    const dbManager = new DatabaseManager(logger);
    await dbManager.init();
    const staticCommandRepo = new StaticCommandRepository(dbManager);

    const cacheManager = new CacheManager(logger);
    await cacheManager.init();

    const connectorManager = new ConnectorManager();

    const scio = new StandardConnectorIO(process.env.EXIT_COMMAND, dbManager, cacheManager, logger);
    await scio.init();
    connectorManager.addConnector(scio);

    const tcio = new TwitchConnectorIO(logger, cacheManager);
    await tcio.init();
    connectorManager.addConnector(tcio);

    const commandHandler = new CommandHandler(connectorManager, staticCommandRepo, logger);
    commandHandler.registerCommand(new RandomCommand(logger));
    commandHandler.registerCommand(new EchoCommand(logger));
    commandHandler.registerCommand(new ListStaticCommandsCommand(logger, staticCommandRepo));
    commandHandler.registerCommand(new ListCommandsCommand(logger, staticCommandRepo, commandHandler));
    commandHandler.registerCommand(new CreateStaticCommandCommand(logger, staticCommandRepo));
    commandHandler.registerCommand(new CommandsCommand(logger));
    commandHandler.registerCommand(new TitleCommand(logger));
    commandHandler.registerCommand(new GameCommand(logger));

    console.log(`Nozomibot is running... command "${scio.exitCommand}" for quit.`);

    scio.displayPrompt();
})();
