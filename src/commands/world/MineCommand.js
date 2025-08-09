const BaseCommand = require('../base/BaseCommand');
const { ValidationError } = require('../../errors/BotError');

class MineCommand extends BaseCommand {
  constructor() {
    super({
      name: 'mine',
      aliases: ['採掘'],
      description:
        '指定したブロックを採掘します。使用法: mine <ブロック名> [数量]',
      validators: [
        (bot, username, args) => {
          if (!args[0]) {
            throw new ValidationError('ブロック名を指定してください。');
          }
        },
      ],
    });
  }

  async run(bot, username, args) {
    if (bot.stateManager.isBusy()) {
      bot.chat('現在、他の作業を実行中です。');
      return;
    }

    const blockName = args[0];
    const count = args[1] ? parseInt(args[1], 10) : 1;

    bot.stateManager.transitionTo('mining', { blockName, count });
  }
}

module.exports = MineCommand;
