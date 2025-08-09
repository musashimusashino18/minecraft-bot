const BaseCommand = require('../base/BaseCommand');
const { ValidationError } = require('../../errors/BotError');

class ChestCommand extends BaseCommand {
  constructor() {
    super({
      name: 'chest',
      aliases: ['チェスト'],
      description: 'チェストを操作します。使用法: chest <open|store>',
      validators: [
        (bot, username, args) => {
          const subCommand = args[0];
          if (
            !subCommand ||
            !['open', '開く', 'store', '保管'].includes(subCommand)
          ) {
            throw new ValidationError(
              '無効なサブコマンドです。 `open` または `store` を使用してください。'
            );
          }
        },
      ],
    });
  }

  async run(bot, username, args) {
    const subCommand = args[0];

    if (subCommand === 'open' || subCommand === '開く') {
      await this.openNearbyChest(bot);
    } else if (subCommand === 'store' || subCommand === '保管') {
      await this.storeItemsInChest(bot);
    }
  }

  async openNearbyChest(bot) {
    try {
      const chestBlock = bot.findBlock({
        matching: (block) =>
          ['chest', 'trapped_chest', 'ender_chest'].includes(block.name),
        maxDistance: 16,
      });

      if (!chestBlock) {
        bot.chat('近くにチェストがありません。');
        return;
      }

      const chest = await bot.openContainer(chestBlock);
      const items = chest.containerItems();
      if (items.length === 0) {
        bot.chat('チェストは空です。');
      } else {
        const itemNames = items
          .map((item) => `${item.displayName} x${item.count}`)
          .join(', ');
        bot.chat(`チェストの中身: ${itemNames}`);
      }
      await chest.close();
    } catch (err) {
      bot.errorHandler.handle(err, 'inventory');
    }
  }

  async storeItemsInChest(bot) {
    try {
      const chestBlock = bot.findBlock({
        matching: (block) => ['chest', 'trapped_chest'].includes(block.name),
        maxDistance: 16,
      });
      if (!chestBlock) {
        bot.chat('近くに保管可能なチェストがありません。');
        return;
      }

      const chest = await bot.openContainer(chestBlock);
      let depositedCount = 0;
      for (const item of bot.inventory.items()) {
        await chest.deposit(item.type, null, item.count);
        depositedCount++;
      }
      bot.chat(`${depositedCount}種類のアイテムをチェストに保管しました。`);
      await chest.close();
    } catch (err) {
      bot.errorHandler.handle(err, 'inventory');
    }
  }
}

module.exports = ChestCommand;
