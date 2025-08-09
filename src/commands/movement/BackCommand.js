const BaseCommand = require("../base/BaseCommand");

class BackCommand extends BaseCommand {
  constructor() {
    super({
      name: "back",
      aliases: ["後ろ"],
      description: "指定した秒数だけ後進します。使用法: back [秒数]",
    });
  }

  async run(bot, username, args) {
    const duration = (args[0] ? parseInt(args[0], 10) : 3) * 1000;
    bot.clearControlStates();
    bot.setControlState("back", true);
    bot.chat(`後進します...`);

    setTimeout(() => {
      bot.setControlState("back", false);
      bot.chat("停止しました。");
    }, duration);
  }
}

module.exports = BackCommand;
