const BaseCommand = require('../base/BaseCommand');

class PosCommand extends BaseCommand {
  constructor() {
    super({
      name: 'pos',
      aliases: ['位置'],
      description: '現在の座標を表示します。',
    });
  }

  async run(bot, _username, _args) {
    const pos = bot.entity.position;
    bot.chat(
      `現在位置: x=${Math.floor(pos.x)}, y=${Math.floor(pos.y)}, z=${Math.floor(pos.z)}`
    );
  }
}

module.exports = PosCommand;
