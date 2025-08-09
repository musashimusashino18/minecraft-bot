const logger = require("../logger");
const {
  BotError,
  MovementError,
  InventoryError,
  PathfindingError, // eslint-disable-line no-unused-vars
  ConnectionError,
  TimeoutError,
  ValidationError, // eslint-disable-line no-unused-vars
} = require("./BotError");

class ErrorHandler {
  constructor(bot, config) {
    this.bot = bot;
    this.config = config || {};
    this.errorCounts = new Map();
    this.recoveryStrategies = new Map([
      ["MovementError", this.handleMovementError.bind(this)],
      ["InventoryError", this.handleInventoryError.bind(this)],
      ["PathfindingError", this.handlePathfindingError.bind(this)],
      ["ConnectionError", this.handleConnectionError.bind(this)],
      ["TimeoutError", this.handleTimeoutError.bind(this)],
      ["ValidationError", this.handleValidationError.bind(this)],
    ]);

    this.maxRetries = this.config.maxRetries || 3;
    this.retryDelay = this.config.retryDelay || 1000;
  }

  async handle(error, context = "", options = {}) {
    try {
      // エラー情報の正規化
      const normalizedError = this.normalizeError(error);
      const errorKey = this.getErrorKey(normalizedError, context);

      // エラー統計の更新
      this.updateErrorStats(errorKey);

      // ログ出力
      await this.logError(normalizedError, context, options);

      // ユーザーへの通知
      await this.notifyUser(normalizedError, context, options);

      // 復旧処理の試行
      if (normalizedError.recoverable && !options.skipRecovery) {
        await this.attemptRecovery(normalizedError, context);
      }

      // 状態のクリーンアップ
      await this.cleanup(normalizedError, context);
    } catch (handlingError) {
      // エラーハンドリング自体でエラーが発生した場合の緊急処理
      logger.error("Error occurred while handling error:", {
        original: error?.message || error,
        handling: handlingError?.message || handlingError,
      });

      // 最小限の処理
      await this.emergencyCleanup();
    }
  }

  normalizeError(error) {
    if (error instanceof BotError) {
      return error;
    }

    // 一般的なエラーを BotError に変換
    if (error instanceof Error) {
      // エラータイプの判定
      const message = error.message.toLowerCase();

      if (message.includes("path") || message.includes("navigation")) {
        return new MovementError(error.message, error);
      }

      if (message.includes("inventory") || message.includes("item")) {
        return new InventoryError(error.message, error);
      }

      if (message.includes("timeout") || message.includes("time out")) {
        return new TimeoutError(error.message, error);
      }

      if (message.includes("connection") || message.includes("disconnect")) {
        return new ConnectionError(error.message, error);
      }

      // Add validation error detection if needed
      // if (message.includes('validation')) {
      //   return new ValidationError(error.message, error);
      // }
    }

    // 文字列や不明なエラーの場合
    const errorMessage =
      typeof error === "string" ? error : "Unknown error occurred";
    return new BotError(errorMessage, { originalError: error }, false);
  }

  getErrorKey(error, context) {
    return `${error.constructor.name}_${context}`;
  }

  updateErrorStats(errorKey) {
    const count = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, count + 1);

    // 頻発するエラーの警告
    if (count > 10) {
      logger.warn(`Error '${errorKey}' has occurred ${count} times`, {
        errorKey,
        count,
      });
    }
  }

  async logError(error, context, options) {
    const logData = {
      ...error.getLogData(),
      context,
      options,
      botStatus: this.getBotStatus(),
      timestamp: new Date().toISOString(),
    };

    if (error.recoverable) {
      logger.warn("Recoverable error occurred:", logData);
    } else {
      logger.error("Critical error occurred:", logData);
    }
  }

  async notifyUser(error, context, options) {
    if (!this.bot || typeof this.bot.chat !== "function") {
      return;
    }

    try {
      if (options.silent) {
        return;
      }

      const userMessage = error.getUserMessage
        ? error.getUserMessage()
        : `❌ エラーが発生しました: ${context}`;

      await this.bot.chat(userMessage);

      // 詳細情報（デバッグモード時のみ）
      if (this.config.debug && error.context) {
        const details = JSON.stringify(error.context, null, 2);
        if (details.length < 100) {
          await this.bot.chat(`詳細: ${details}`);
        }
      }
    } catch (chatError) {
      logger.error("Failed to send error message to chat:", chatError);
    }
  }

  async attemptRecovery(error, context) {
    const strategy = this.recoveryStrategies.get(error.constructor.name);

    if (!strategy) {
      logger.debug(`No recovery strategy found for ${error.constructor.name}`);
      return false;
    }

    const retries = this.errorCounts.get(this.getErrorKey(error, context)) || 0;

    if (retries > this.maxRetries) {
      logger.warn(
        `Max retries exceeded for ${error.constructor.name}. Giving up.`,
      );
      return false;
    }

    try {
      logger.info(
        `Attempting recovery for ${error.constructor.name} (attempt ${retries + 1})`,
      );

      await new Promise((resolve) =>
        setTimeout(resolve, this.retryDelay * retries),
      );
      await strategy(error, context);

      logger.info(`Recovery successful for ${error.constructor.name}`);
      if (this.bot && typeof this.bot.chat === "function") {
        await this.bot.chat(" 自動回復に成功しました");
      }

      return true;
    } catch (recoveryError) {
      logger.error(
        `Recovery failed for ${error.constructor.name}:`,
        recoveryError,
      );
      return false;
    }
  }

  async cleanup(_error, _context) {
    try {
      // StateManager のクリーンアップ
      if (
        this.bot?.stateManager &&
        typeof this.bot.stateManager.interrupt === "function"
      ) {
        await this.bot.stateManager.interrupt("error");
      }

      // Pathfinder の停止
      if (
        this.bot?.pathfinder &&
        typeof this.bot.pathfinder.stop === "function"
      ) {
        this.bot.pathfinder.stop();
      }

      // コントロール状態のリセット
      if (this.bot && typeof this.bot.clearControlStates === "function") {
        this.bot.clearControlStates();
      }
    } catch (cleanupError) {
      logger.error("Error during cleanup:", cleanupError);
    }
  }

  async emergencyCleanup() {
    try {
      if (this.bot && typeof this.bot.chat === "function") {
        await this.bot.chat("⚠️ 緊急停止しました");
      }

      // 最小限の停止処理
      if (this.bot?.pathfinder?.stop) {
        this.bot.pathfinder.stop();
      }

      if (this.bot?.clearControlStates) {
        this.bot.clearControlStates();
      }
    } catch (_error) {
      // 何もできない場合は諦める
      logger.error("Emergency cleanup failed:", _error);
    }
  }

  getBotStatus() {
    if (!this.bot) return { status: "no_bot" };

    try {
      return {
        health: this.bot.health,
        food: this.bot.food,
        position: this.bot.entity?.position,
        currentState: this.bot.stateManager?.currentStateName,
        username: this.bot.username,
      };
    } catch (_error) {
      return { status: "error_getting_status", error: _error.message };
    }
  }

  // 復旧戦略の実装
  async handleMovementError(_error, _context) {
    if (this.bot?.pathfinder) {
      this.bot.pathfinder.stop();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  async handleInventoryError(_error, _context) {
    // インベントリ関連エラーの復旧
    try {
      if (this.bot?.closeWindow) {
        await this.bot.closeWindow(this.bot.currentWindow);
      }
    } catch (_error) {
      // ウィンドウクローズに失敗しても続行
    }
  }

  async handlePathfindingError(_error, _context) {
    if (this.bot?.pathfinder) {
      this.bot.pathfinder.stop();
      // パスファインダーの設定をリセット
      const mcData = this.bot.mcData;
      if (mcData) {
        const { Movements } = require("mineflayer-pathfinder");
        const movements = new Movements(this.bot, mcData);
        this.bot.pathfinder.setMovements(movements);
      }
    }
  }

  async handleConnectionError(_error, _context) {
    // 接続エラーは基本的に回復不能
    logger.error("Connection error - manual intervention required");
  }

  async handleTimeoutError(_error, _context) {
    // タイムアウトエラーの場合、現在の処理を停止
    if (this.bot?.pathfinder) {
      this.bot.pathfinder.stop();
    }
  }

  async handleValidationError(_error, _context) {
    // バリデーションエラーは回復不能（ユーザー入力の問題）
    return false;
  }

  getErrorStats() {
    return {
      totalErrors: Array.from(this.errorCounts.values()).reduce(
        (sum, count) => sum + count,
        0,
      ),
      errorsByType: Object.fromEntries(this.errorCounts),
      timestamp: new Date().toISOString(),
    };
  }

  clearErrorStats() {
    this.errorCounts.clear();
  }
}

module.exports = ErrorHandler;
