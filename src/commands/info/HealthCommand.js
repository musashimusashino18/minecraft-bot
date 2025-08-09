const BaseCommand = require("../base/BaseCommand");

class HealthCommand extends BaseCommand {
  constructor() {
    super({
      name: "health",
      aliases: ["体力"],
      description: "現在の体力と空腹度を表示します。",
    });
  }

  async run(bot, _username, _args) {
    bot.chat(`体力: ${bot.health}/20, 空腹度: ${bot.food}/20`);
  }
}

module.exports = HealthCommand;
