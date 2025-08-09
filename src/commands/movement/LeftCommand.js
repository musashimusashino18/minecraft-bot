const BaseCommand = require('../base/BaseCommand');

class LeftCommand extends BaseCommand {
  constructor() {
    super({
      name: 'left',
      aliases: ['左'],
      description: '指定した秒数だけ左に進みます。使用法: left [秒数]',
    });
  }

  async run(bot, username, args) {
    const duration = (args[0] ? parseInt(args[0], 10) : 3) * 1000;
    bot.clearControlStates();
    bot.setControlState('left', true);
    bot.chat(`左に移動します...`);

    setTimeout(() => {
      bot.setControlState('left', false);
      bot.chat('停止しました。');
    }, duration);
  }
}

module.exports = LeftCommand;
