const BaseCommand = require('../base/BaseCommand');

class PlayersCommand extends BaseCommand {
  constructor() {
    super({
      name: 'players',
      aliases: ['プレイヤー'],
      description: '近くにいるプレイヤーを一覧表示します。',
    });
  }

  async run(bot, _username, _args) {
    const players = Object.values(bot.players).filter((player) => {
      return player.entity && player.username !== bot.username;
    });

    if (players.length === 0) {
      bot.chat('近くにプレイヤーはいません');
      return;
    }

    bot.chat(`=== 近くのプレイヤー (${players.length}人) ===`);
    players.forEach((player) => {
      const distance = bot.entity.position.distanceTo(player.entity.position);
      bot.chat(`${player.username}: ${Math.floor(distance)}m`);
    });
  }
}

module.exports = PlayersCommand;
