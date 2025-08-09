const BaseCommand = require("../base/BaseCommand");

class MobsCommand extends BaseCommand {
  constructor() {
    super({
      name: "mobs",
      aliases: ["モブ"],
      description: "近くにいるモブを一覧表示します。",
    });
  }

  async run(bot, _username, _args) {
    const mobs = Object.values(bot.entities).filter((entity) => {
      return (
        entity.mobType && entity.position.distanceTo(bot.entity.position) <= 20
      );
    });

    if (mobs.length === 0) {
      bot.chat("近くにモブはいません");
      return;
    }

    bot.chat(`=== 近くのモブ (${mobs.length}体) ===`);
    const mobCounts = {};
    mobs.forEach((mob) => {
      const type = mob.mobType;
      mobCounts[type] = (mobCounts[type] || 0) + 1;
    });

    Object.entries(mobCounts).forEach(([type, count]) => {
      bot.chat(`${type}: ${count}体`);
    });
  }
}

module.exports = MobsCommand;
