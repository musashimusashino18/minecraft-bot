const logger = require('../logger');

module.exports = (bot) => {
  bot.on('error', (err) => {
    logger.error('❌ エラーが発生しました:', err);
  });
};
