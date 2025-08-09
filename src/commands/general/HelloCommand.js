const BaseCommand = require('../base/BaseCommand');

class HelloCommand extends BaseCommand {
  constructor() {
    super({
      name: 'hello',
      aliases: ['こんにちは'],
      description: '挨拶を返します。',
      permissions: ['basic'],
    });
  }

  async run(bot, username, _args) {
    bot.chat(`こんにちは、${username}さん！元気ですよ！`);
  }
}

module.exports = HelloCommand;
