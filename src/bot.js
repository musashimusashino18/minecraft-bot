const mineflayer = require('mineflayer');
const { pathfinder } = require('mineflayer-pathfinder');
const { botOptions } = require('./config');
const { wrapEnchantsGetterOnPrototype } = require('./utils');
const StateManager = require('./stateManager');
const { loadCommands } = require('./commandLoader');
const ErrorHandler = require('./errors/ErrorHandler');

function createBot() {
  const bot = mineflayer.createBot(botOptions);

  bot.loadPlugin(pathfinder);

  // ErrorHandlerを統合
  bot.errorHandler = new ErrorHandler(bot);

  // StateManagerを統合
  bot.stateManager = new StateManager(bot);

  // 従来のbot.state は削除して、stateManager経由でアクセス
  Object.defineProperty(bot, 'state', {
    get: () => bot.stateManager,
    configurable: false,
  });

  // コマンドをロード
  loadCommands(bot);

  // prismarine-itemのパッチを適用
  applyPrismarineItemPatch();

  // イベントハンドラーを設定
  setupEventHandlers(bot);

  return bot;
}

const logger = require('./logger');

function applyPrismarineItemPatch() {
  try {
    const prismarineItemModule = require('prismarine-item');
    const ItemClass =
      (prismarineItemModule && prismarineItemModule.Item) ||
      (prismarineItemModule &&
        prismarineItemModule.default &&
        prismarineItemModule.default.Item) ||
      (typeof prismarineItemModule === 'function'
        ? prismarineItemModule
        : null);

    if (ItemClass && ItemClass.prototype) {
      wrapEnchantsGetterOnPrototype(ItemClass.prototype);
      logger.info(
        'prismarine-item.enchants を安全ラップしました（例外時は空配列を返します）'
      );
    } else {
      logger.warn(
        'prismarine-item の Item クラスが見つかりませんでした。パッチ未実行'
      );
    }
  } catch (e) {
    logger.warn(
      'prismarine-item パッチ適用中に例外:',
      e && e.message ? e.message : e
    );
  }
}

function setupEventHandlers(bot) {
  const loadEvents = require('./eventLoader');
  loadEvents(bot);
}

module.exports = { createBot };
