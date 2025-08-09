const BaseCommand = require("../base/BaseCommand");

class TimeCommand extends BaseCommand {
  constructor() {
    super({
      name: "time",
      aliases: ["時間"],
      description: "現在のゲーム内時刻を表示します。",
    });
  }

  async run(bot, _username, _args) {
    const timeOfDay = bot.time.timeOfDay;
    const hours = Math.floor((timeOfDay / 1000 + 6) % 24);
    const minutes = Math.floor(((timeOfDay % 1000) / 1000) * 60);
    bot.chat(`現在時刻: ${hours}:${minutes.toString().padStart(2, "0")}`);
  }
}

module.exports = TimeCommand;
