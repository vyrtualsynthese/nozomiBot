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
    const TwitchConnectorIO = require('./lib/Connector/TwitchConnectorIO');
    const TwitchRefreshStreamInfoScheduler = require('./lib/Scheduler/TwitchRefreshStreamInfoScheduler');
    const TwitchAPIHandler = require('./lib/APIHandler/TwitchAPIHandler');
    const ConnectorManager = require('./lib/Connector/ConnectorManager');
    const CommandHandler = require('./lib/Command/CommandHandler');
    const EchoCommand = require('./lib/Command/EchoCommand');
    const CreateStaticCommandCommand = require('./lib/Command/Commands/CreateStaticCommandCommand');
    const RemoveStaticCommandCommand = require('./lib/Command/Commands/RemoveStaticCommandCommand');
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
    const PlaytimeCommand = require('./lib/Command/PlaytimeCommand');
    const PauseCommand = require('./lib/Command/PauseCommand');
    const ResumeCommand = require('./lib/Command/ResumeCommand');
    const KillCommand = require('./lib/Command/KillCommand');
    const MuteCommand = require('./lib/Command/MuteCommand');
    const UnmuteCommand = require('./lib/Command/UnmuteCommand');
    const FollowsMessageCommand = require('./lib/Command/FollowsMessageCommand');
    const FollowsCommand = require('./lib/Command/FollowsCommand');
    const StaticCommandRepository = require('./lib/Database/Repository/StaticCommandRepository');
    const UserRepository = require('./lib/Database/Repository/UserRepository');
    const StreamInfoRepository = require('./lib/Database/Repository/StreamInfoRepository');
    const GameChangeRepository = require('./lib/Database/Repository/GameChangeRepository');
    const ParametersRepository = require('./lib/Database/Repository/ParametersRepository');
    const WebhookServer = require('./lib/Webhook/WebhookServer');
    const TwitchWebhook = require('./lib/Webhook/TwitchWebhook');

    const dbManager = new DatabaseManager(logger);
    await dbManager.init();
    const staticCommandRepo = new StaticCommandRepository();
    const userRepo = new UserRepository();
    const streamInfoRepo = new StreamInfoRepository();
    const gameChangeRepo = new GameChangeRepository();
    const parametersRepo = new ParametersRepository();

    const cacheManager = new CacheManager(logger);
    await cacheManager.init();

    const webhookServer = new WebhookServer(logger, 3000);
    webhookServer.init();

    const connectorManager = new ConnectorManager();

    const scio = new StandardConnectorIO(process.env.EXIT_COMMAND, dbManager, cacheManager, webhookServer, logger);
    await scio.init();
    connectorManager.addConnector(scio);

    const twitchAPIHandler = new TwitchAPIHandler(logger, cacheManager);
    const twitchRefreshStreamInfoScheduler = new TwitchRefreshStreamInfoScheduler(logger, twitchAPIHandler, gameChangeRepo);
    await twitchRefreshStreamInfoScheduler.init();

    const tcio = new TwitchConnectorIO(logger, userRepo, twitchAPIHandler);
    await tcio.init();
    connectorManager.addConnector(tcio);

    const twitchWebhook = new TwitchWebhook(logger, webhookServer, cacheManager, streamInfoRepo, tcio, twitchAPIHandler, parametersRepo);
    await twitchWebhook.init();

    const commandHandler = new CommandHandler(connectorManager, staticCommandRepo, logger, parametersRepo);
    commandHandler.registerCommand(new RandomCommand(logger));
    commandHandler.registerCommand(new EchoCommand(logger));
    commandHandler.registerCommand(new ListStaticCommandsCommand(logger, staticCommandRepo));
    commandHandler.registerCommand(new ListCommandsCommand(logger, staticCommandRepo, commandHandler));
    commandHandler.registerCommand(new CreateStaticCommandCommand(logger, staticCommandRepo));
    commandHandler.registerCommand(new RemoveStaticCommandCommand(logger, staticCommandRepo));
    commandHandler.registerCommand(new CommandsCommand(logger));
    commandHandler.registerCommand(new TitleCommand(logger, twitchAPIHandler));
    commandHandler.registerCommand(new GameCommand(logger, twitchAPIHandler));
    commandHandler.registerCommand(new LastCommand(logger, userRepo));
    commandHandler.registerCommand(new UptimeCommand(logger, twitchAPIHandler));
    commandHandler.registerCommand(new UsersCommand(logger, twitchAPIHandler));
    commandHandler.registerCommand(new ModsCommand(logger, twitchAPIHandler));
    commandHandler.registerCommand(new PlaytimeCommand(logger, gameChangeRepo, twitchAPIHandler));
    commandHandler.registerCommand(new PauseCommand(logger, parametersRepo));
    commandHandler.registerCommand(new ResumeCommand(logger, parametersRepo));
    commandHandler.registerCommand(new KillCommand(logger));
    commandHandler.registerCommand(new MuteCommand(logger, parametersRepo));
    commandHandler.registerCommand(new UnmuteCommand(logger, parametersRepo));
    commandHandler.registerCommand(new FollowsMessageCommand(logger, parametersRepo));
    commandHandler.registerCommand(new FollowsCommand(logger, parametersRepo));

    console.log(`Nozomibot is running... command "${scio.exitCommand}" for quit.`);

    scio.displayPrompt();
})();
