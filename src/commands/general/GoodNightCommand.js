const BaseCommand = require('../base/BaseCommand');

class GoodNightCommand extends BaseCommand {
  constructor() {
    super({
      name: 'goodnight',
      aliases: ['おやすみ'],
      description: '夜の挨拶を返します。',
      permissions: ['basic'],
    });
  }

  async run(bot, username, _args) {
    bot.chat(`おやすみなさい、${username}さん！良い夢を！`);
  }
}

module.exports = GoodNightCommand;
