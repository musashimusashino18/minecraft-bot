const BaseCommand = require('../base/BaseCommand');
const { GoalNear } = require('mineflayer-pathfinder').goals;

class ComeCommand extends BaseCommand {
  constructor() {
    super({
      name: 'come',
      aliases: ['おいで'],
      description: 'コマンドを呼び出したプレイヤーの元へ移動します。',
    });
  }

  async run(bot, username, _args) {
    if (bot.stateManager.isBusy()) {
      bot.chat('現在、他の作業を実行中です。');
      return;
    }

    const player = bot.players[username];
    if (!player || !player.entity) {
      bot.chat(`${username}さんが見つかりません`);
      return;
    }

    bot.chat(`${username}さんの元に向かいます！`);
    const { x, y, z } = player.entity.position;
    bot.stateManager.transitionTo('moving', { goal: new GoalNear(x, y, z, 2) });
  }
}

module.exports = ComeCommand;
