const mineflayer = require('mineflayer');
const logger = require('./logger');
const DIContainer = require('./core/DIContainer');
const CommandRegistry = require('./core/CommandRegistry');
const EventBus = require('./core/EventBus');
const PluginManager = require('./core/PluginManager');
const CacheManager = require('./cache/CacheManager');
const StateManager = require('./stateManager');
const ErrorHandler = require('./errors/ErrorHandler');
const { loadCommands } = require('./commandLoader');
const loadEvents = require('./eventLoader');

class BotFactory {
  static async create(config = {}) {
    const bot = mineflayer.createBot({
      ...config.connection,
    });

    const container = new DIContainer();
    container.register('bot', bot);
    container.register('config', config);
    container.register('logger', logger);

    container.register('eventBus', new EventBus());
    container.register('commandRegistry', new CommandRegistry());

    // Register and resolve errorHandler BEFORE stateManager
    container.register('errorHandler', () => new ErrorHandler(bot));
    bot.errorHandler = container.resolve('errorHandler'); // Assign errorHandler to bot here

    container.register('cacheManager', () => new CacheManager(bot));
    container.register('stateManager', () => new StateManager(bot)); // Now bot.errorHandler should be defined

    bot.container = container;
    bot.config = container.resolve('config');
    bot.logger = container.resolve('logger');
    bot.eventBus = container.resolve('eventBus');
    bot.commandRegistry = container.resolve('commandRegistry');
    bot.cacheManager = container.resolve('cacheManager');
    bot.stateManager = container.resolve('stateManager');
    // bot.errorHandler is already assigned above

    const pluginManager = new PluginManager(container);
    await pluginManager.loadPlugins(config.plugins || []);

    loadCommands(bot);

    loadEvents(bot);

    return bot;
  }
}

module.exports = BotFactory;
