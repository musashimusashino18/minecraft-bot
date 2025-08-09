const logger = require("../logger");

class ErrorHandler {
  constructor(bot) {
    this.bot = bot;
    this.recoveryStrategies = new Map([
      ["MovementError", this.handleMovementError.bind(this)],
      // 他のリカバリー戦略をここに追加
    ]);
  }

  async handle(error, context = "") {
    const logData = error.getLogData
      ? error.getLogData()
      : {
          message: error.message,
          stack: error.stack,
          context,
        };

    logger.error("Bot Error:", logData);

    const userMessage = error.getUserMessage
      ? error.getUserMessage()
      : "操作に失敗しました";
    this.bot.chat(userMessage);

    if (error.recoverable) {
      await this.attemptRecovery(error);
    }

    if (this.bot.stateManager) {
      await this.bot.stateManager.interrupt("error");
    }
  }

  async attemptRecovery(error) {
    const strategy = this.recoveryStrategies.get(error.constructor.name);
    if (strategy) {
      try {
        await strategy(error);
        this.bot.chat(" 自動回復を試行中...");
      } catch (recoveryError) {
        logger.error("Recovery failed:", recoveryError);
      }
    }
  }

  async handleMovementError(_error) {
    this.bot.pathfinder.stop();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

module.exports = ErrorHandler;
