'use strict';

(async () => {
    require('dotenv').load();
    if (!process.env.NODE_ENV) { process.env.NODE_ENV = 'prod'; }

    const fs = require('fs');

    const logger = require('pino')({
        extreme: false,
        base: null,
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
    const LastCommand = require('./lib/Command/LastCommand');
    const UptimeCommand = require('./lib/Command/UptimeCommand');
    const UsersCommand = require('./lib/Command/UsersCommand');
    const ModsCommand = require('./lib/Command/ModsCommand');
    const TwitchConnectorIO = require('./lib/Connector/TwitchConnectorIO');
    const StaticCommandRepository = require('./lib/Database/Repository/StaticCommandRepository');
    const UserRepository = require('./lib/Database/Repository/UserRepository');
    const StreamInfoRepository = require('./lib/Database/Repository/StreamInfoRepository');
    const WebhookServer = require('./lib/Webhook/WebhookServer');
    const TwitchWebhook = require('./lib/Webhook/TwitchWebhook');

    const dbManager = new DatabaseManager(logger);
    await dbManager.init();
    const staticCommandRepo = new StaticCommandRepository(dbManager);
    const userRepo = new UserRepository(dbManager);
    const streamInfoRepo = new StreamInfoRepository(dbManager);

    const cacheManager = new CacheManager(logger);
    await cacheManager.init();

    const webhookServer = new WebhookServer(logger, 3000);
    webhookServer.init();
    const twitchWebhook = new TwitchWebhook(logger, webhookServer, cacheManager, streamInfoRepo);
    await twitchWebhook.init();

    const connectorManager = new ConnectorManager();

    const scio = new StandardConnectorIO(process.env.EXIT_COMMAND, dbManager, cacheManager, webhookServer, logger);
    await scio.init();
    connectorManager.addConnector(scio);

    const tcio = new TwitchConnectorIO(logger, cacheManager, userRepo);
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
    commandHandler.registerCommand(new LastCommand(logger, userRepo));
    commandHandler.registerCommand(new UptimeCommand(logger));
    commandHandler.registerCommand(new UsersCommand(logger));
    commandHandler.registerCommand(new ModsCommand(logger));

    console.log(`Nozomibot is running... command "${scio.exitCommand}" for quit.`);

    scio.displayPrompt();
})();
