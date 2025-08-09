const BaseCommand = require('../base/BaseCommand');

class GoodMorningCommand extends BaseCommand {
  constructor() {
    super({
      name: 'goodmorning',
      aliases: ['おはよう'],
      description: '朝の挨拶を返します。',
      permissions: ['basic'],
    });
  }

  async run(bot, username, _args) {
    bot.chat(
      `おはようございます、${username}さん！今日もよろしくお願いします！`
    );
  }
}

module.exports = GoodMorningCommand;
