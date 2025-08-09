const logger = require("./logger");

class ErrorHandler {
  static handle(bot, error, context = "") {
    const errorMessage = error?.message || "不明なエラー";
    logger.error(`${context}: ${errorMessage}`, error);

    if (bot.stateManager) {
      bot.stateManager.clearTask();
    }

    // ユーザーフレンドリーなメッセージ
    const friendlyMessages = {
      pathfinding: "ナビゲーションに失敗しました",
      inventory: "インベントリ操作に失敗しました",
      mining: "採掘に失敗しました",
    };

    const userMessage = friendlyMessages[context] || "操作に失敗しました";
    bot.chat(`❌ ${userMessage}`);
  }
}

module.exports = ErrorHandler;
