const BaseCommand = require('../base/BaseCommand');
const { ValidationError } = require('../../errors/BotError');

class BuildCommand extends BaseCommand {
  constructor() {
    super({
      name: 'build',
      aliases: ['建築'],
      description: '何かを建築します。使用法: build <tower> [サイズ]',
      validators: [
        (bot, username, args) => {
          if (!args[0]) {
            throw new ValidationError(
              '建築物の種類を指定してください (例: tower)。'
            );
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

    const structureType = args[0];
    const size = args[1] ? parseInt(args[1], 10) : 5;

    if (structureType === 'tower' || structureType === '塔') {
      bot.stateManager.transitionTo('building', { structureType, size });
    } else {
      bot.chat('現在サポートされている建築は `tower` のみです。');
    }
  }
}

module.exports = BuildCommand;
