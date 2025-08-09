const BaseCommand = require("../base/BaseCommand");

class RightCommand extends BaseCommand {
  constructor() {
    super({
      name: "right",
      aliases: ["右"],
      description: "指定した秒数だけ右に進みます。使用法: right [秒数]",
    });
  }

  async run(bot, username, args) {
    const duration = (args[0] ? parseInt(args[0], 10) : 3) * 1000;
    bot.clearControlStates();
    bot.setControlState("right", true);
    bot.chat(`右に移動します...`);

    setTimeout(() => {
      bot.setControlState("right", false);
      bot.chat("停止しました。");
    }, duration);
  }
}

module.exports = RightCommand;
