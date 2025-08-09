const BaseCommand = require('../base/BaseCommand');

class JumpCommand extends BaseCommand {
  constructor() {
    super({
      name: 'jump',
      aliases: ['ジャンプ'],
      description: 'ジャンプします。',
    });
  }

  async run(bot, _username, _args) {
    bot.setControlState('jump', true);
    bot.setControlState('jump', false);
    bot.chat('ジャンプ！');
  }
}

module.exports = JumpCommand;
