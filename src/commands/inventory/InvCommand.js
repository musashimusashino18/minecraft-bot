const BaseCommand = require("../base/BaseCommand");

class InvCommand extends BaseCommand {
  constructor() {
    super({
      name: "inv",
      aliases: ["inventory", "インベントリ"],
      description: "インベントリの内容を表示します。",
    });
  }

  async run(bot, _username, _args) {
    const items = bot.inventory.items();

    if (items.length === 0) {
      bot.chat("インベントリは空です");
      return;
    }

    bot.chat(`=== インベントリ (${items.length}/36) ===`);

    const itemCounts = {};
    items.forEach((item) => {
      const name = item.displayName || item.name;
      itemCounts[name] = (itemCounts[name] || 0) + item.count;
    });

    Object.entries(itemCounts).forEach(([name, count]) => {
      bot.chat(`${name}: ${count}個`);
    });
  }
}

module.exports = InvCommand;
