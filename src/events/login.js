const logger = require('../logger');

module.exports = (bot) => {
  bot.on('login', () => {
    logger.info(`✅ ボットが ${bot.username} としてログインしました`);
    logger.info(`🌍 サーバー: ${bot.host}:${bot.port}`);
  });
};
