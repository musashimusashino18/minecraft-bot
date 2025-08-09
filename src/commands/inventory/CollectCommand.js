const BaseCommand = require('../base/BaseCommand');

class CollectCommand extends BaseCommand {
  constructor() {
    super({
      name: 'collect',
      aliases: ['収集'],
      description:
        '近くに落ちているアイテムを収集します。使用法: collect [アイテム名]',
    });
  }

  async run(bot, username, args) {
    if (bot.stateManager.isBusy()) {
      bot.chat('現在、他の作業を実行中です。完了してから再度お試しください。');
      return;
    }

    const itemName = args[0];

    bot.stateManager.transitionTo('collecting', { itemName });
  }
}

module.exports = CollectCommand;
