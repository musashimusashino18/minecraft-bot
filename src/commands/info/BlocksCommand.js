const BaseCommand = require('../base/BaseCommand');

class BlocksCommand extends BaseCommand {
  constructor() {
    super({
      name: 'blocks',
      aliases: ['ブロック'],
      description: '近くにあるブロックを一覧表示します。',
    });
  }

  async run(bot, _username, _args) {
    const pos = bot.entity.position;
    const blocks = {};

    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        for (let z = -2; z <= 2; z++) {
          const block = bot.blockAt(pos.offset(x, y, z));
          if (block && block.name !== 'air') {
            blocks[block.displayName] = (blocks[block.displayName] || 0) + 1;
          }
        }
      }
    }

    if (Object.keys(blocks).length === 0) {
      bot.chat('近くに特筆すべきブロックはありません');
      return;
    }

    bot.chat('=== 近くのブロック (5x5x5範囲) ===');
    Object.entries(blocks)
      .slice(0, 5)
      .forEach(([name, count]) => {
        bot.chat(`${name}: ${count}個`);
      });
  }
}

module.exports = BlocksCommand;
