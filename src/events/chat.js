const { handleChatCommands } = require('../commandHandler');
const logger = require('../logger');

module.exports = (bot) => {
  bot.on('chat', (username, message) => {
    // 自分のメッセージは無視
    if (username === bot.username) return;

    logger.info(`💬 ${username}: ${message}`);
    handleChatCommands(bot, username, message);
  });
};
