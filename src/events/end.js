const logger = require('../logger');
const config = require('../config');

module.exports = (bot) => {
  let reconnectAttempts = 0;

  bot.on('end', () => {
    logger.info('🔌 サーバーから切断されました');

    const reconnect = () => {
      if (reconnectAttempts >= 5) {
        logger.error('❌ 最大再接続回数に達しました。終了します。');
        process.exit(1);
        return;
      }

      reconnectAttempts++;
      const delay = Math.min(config.reconnectDelay * reconnectAttempts, 60000);

      logger.info(
        `🔄 ${delay / 1000}秒後に再接続します... (${reconnectAttempts}/5)`
      );

      setTimeout(() => {
        // 新しいボットを作成する代わりに、既存のボットを再接続
        // bot.connect(bot.host, bot.port); // Reconnection logic needs to be refactored to use BotFactory
      }, delay);
    };

    reconnect();
  });
};
