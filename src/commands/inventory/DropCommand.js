const BaseCommand = require('../base/BaseCommand');
const { ValidationError } = require('../../errors/BotError');

class DropCommand extends BaseCommand {
  constructor() {
    super({
      name: 'drop',
      aliases: ['捨てる'],
      description:
        '指定したアイテムを捨てます。使用法: drop <アイテム名> [数量]',
      validators: [
        (bot, username, args) => {
          if (!args[0]) {
            throw new ValidationError('アイテム名を指定してください。');
          }
        },
      ],
    });
  }

  async run(bot, username, args) {
    const itemName = args[0];
    const quantity = args[1] ? parseInt(args[1], 10) : null; // Drop all if quantity is not specified

    try {
      const item = bot.inventory.findInventoryItem(itemName);
      if (!item) {
        bot.chat(`${itemName}がインベントリに見つかりません`);
        return;
      }

      const dropAmount =
        quantity === null ? item.count : Math.min(quantity, item.count);
      await bot.toss(item.type, null, dropAmount);
      bot.chat(`${itemName}を${dropAmount}個捨てました`);
    } catch (err) {
      bot.chat('アイテムを捨てられませんでした');
      this.bot.logger.error('Drop error:', err);
    }
  }
}

module.exports = DropCommand;
