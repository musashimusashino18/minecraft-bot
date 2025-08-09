const mineflayer = require("mineflayer");
const logger = require("./logger");
const ConfigManager = require("./config/ConfigManager");
const DIContainer = require("./core/DIContainer");
const CommandRegistry = require("./core/CommandRegistry");
const EventBus = require("./core/EventBus");
const PluginManager = require("./core/PluginManager");
const CacheManager = require("./cache/CacheManager");
const StateManager = require("./stateManager");
const ErrorHandler = require("./errors/ErrorHandler");
const { loadCommands } = require("./commandLoader");
const loadEvents = require("./eventLoader");
const MetricsCollector = require("./metrics"); // Added this line

class BotFactory {
  static async create(options = {}) {
    const startTime = Date.now();
    logger.info("ボット作成を開始します...");

    try {
      // 設定の読み込み
      const configManager = new ConfigManager();
      const config = configManager.getAll();

      // オプションで設定を上書き
      if (options.connection) {
        Object.assign(config.bot, options.connection.bot || {});
      }

      // ボットの作成設定
      const botOptions = {
        host: config.bot.host,
        port: config.bot.port,
        username: config.bot.username,
        version: config.bot.version,
      };

      // パスワード設定（存在する場合のみ）
      if (config.bot.password) {
        botOptions.password = config.bot.password;
      }

      logger.info("mineflayerボットを作成中...", {
        host: botOptions.host,
        port: botOptions.port,
        username: botOptions.username,
      });

      const bot = mineflayer.createBot(botOptions);

      // DIコンテナのセットアップ
      const container = new DIContainer();
      await BotFactory.setupContainer(container, bot, config, configManager);

      // ボットにサービスを注入
      BotFactory.injectServices(bot, container);

      // プラグインマネージャーの設定
      const pluginManager = new PluginManager(container);
      await pluginManager.loadPlugins(options.plugins || []);

      // コマンドとイベントの読み込み
      loadCommands(bot);
      loadEvents(bot);

      // 起動完了の待機
      await BotFactory.waitForReady(
        bot,
        config.timeouts?.connectionTimeout || 30000,
      );

      logger.info(`ボット作成完了 (${Date.now() - startTime}ms)`, {
        username: bot.username,
        host: bot.host,
        port: bot.port,
      });

      return bot;
    } catch (error) {
      logger.error("ボット作成に失敗しました:", error);
      throw error;
    }
  }

  static async setupContainer(container, bot, config, configManager) {
    try {
      // 基本サービスの登録
      container.register("bot", bot);
      container.register("config", config);
      container.register("configManager", configManager);
      container.register("logger", logger);

      // コアサービスの登録
      container.register("eventBus", new EventBus());
      container.register("commandRegistry", new CommandRegistry());

      // エラーハンドラーの登録（他のサービスより先に）
      container.register(
        "errorHandler",
        () => new ErrorHandler(bot, config.error || {}),
      );

      // その他のサービス
      container.register("cacheManager", () => new CacheManager(bot));
      container.register("stateManager", () => new StateManager(bot));
      container.register("metrics", () => new MetricsCollector()); // Added this line

      logger.debug("DIコンテナのセットアップが完了しました");
    } catch (error) {
      logger.error("DIコンテナのセットアップに失敗しました:", error);
      throw error;
    }
  }

  static injectServices(bot, container) {
    try {
      // ボットオブジェクトにサービスを注入
      bot.container = container;
      bot.config = container.resolve("config");
      bot.configManager = container.resolve("configManager");
      bot.logger = container.resolve("logger");
      bot.eventBus = container.resolve("eventBus");
      bot.commandRegistry = container.resolve("commandRegistry");
      bot.errorHandler = container.resolve("errorHandler");
      bot.cacheManager = container.resolve("cacheManager");
      bot.stateManager = container.resolve("stateManager");
      bot.metrics = container.resolve("metrics"); // Added this line

      logger.debug("サービスの注入が完了しました");
    } catch (error) {
      logger.error("サービスの注入に失敗しました:", error);
      throw error;
    }
  }

  static async waitForReady(bot, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`ボットの起動がタイムアウトしました (${timeout}ms)`));
      }, timeout);

      const cleanup = () => {
        clearTimeout(timer);
        bot.removeListener("spawn", onSpawn);
        bot.removeListener("error", onError);
        bot.removeListener("end", onEnd);
      };

      const onSpawn = () => {
        cleanup();
        logger.info("ボットがスポーンしました");
        resolve();
      };

      const onError = (error) => {
        cleanup();
        reject(
          new Error(`ボットの起動中にエラーが発生しました: ${error.message}`),
        );
      };

      const onEnd = () => {
        cleanup();
        reject(new Error("ボットの接続が予期せず終了しました"));
      };

      bot.once("spawn", onSpawn);
      bot.once("error", onError);
      bot.once("end", onEnd);
    });
  }

  // 安全な終了処理
  static async shutdown(bot) {
    if (!bot) return;

    logger.info("ボットをシャットダウン中...");

    try {
      // 現在の作業を停止
      if (
        bot.stateManager &&
        typeof bot.stateManager.interrupt === "function"
      ) {
        await bot.stateManager.interrupt("shutdown");
      }

      // パスファインダーを停止
      if (bot.pathfinder && typeof bot.pathfinder.stop === "function") {
        bot.pathfinder.stop();
      }

      // コントロール状態をクリア
      if (typeof bot.clearControlStates === "function") {
        bot.clearControlStates();
      }

      // キャッシュマネージャーの停止
      if (
        bot.cacheManager &&
        typeof bot.cacheManager.stopCleanup === "function"
      ) {
        bot.cacheManager.stopCleanup();
      }

      // 最後にお別れのメッセージ
      if (typeof bot.chat === "function") {
        await bot.chat(" またね！");
      }

      // 接続を終了
      if (typeof bot.end === "function") {
        bot.end();
      }

      logger.info("ボットのシャットダウンが完了しました");
    } catch (error) {
      logger.error("シャットダウン中にエラーが発生しました:", error);
    }
  }

  // ヘルスチェック
  static getHealthStatus(bot) {
    if (!bot) {
      return { status: "error", message: "ボットが存在しません" };
    }

    try {
      const status = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        bot: {
          username: bot.username,
          health: bot.health,
          food: bot.food,
          position: bot.entity?.position,
          online: !!bot.player,
        },
        state: {
          current: bot.stateManager?.currentStateName || "unknown",
          busy: bot.stateManager?.isBusy() || false,
        },
        services: {
          errorHandler: !!bot.errorHandler,
          stateManager: !!bot.stateManager,
          cacheManager: !!bot.cacheManager,
          pathfinder: !!bot.pathfinder,
          metrics: !!bot.metrics, // Added this line
        },
      };

      // エラー統計の追加
      if (
        bot.errorHandler &&
        typeof bot.errorHandler.getErrorStats === "function"
      ) {
        status.errorStats = bot.errorHandler.getErrorStats();
      }

      return status;
    } catch (error) {
      return {
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

module.exports = BotFactory;
