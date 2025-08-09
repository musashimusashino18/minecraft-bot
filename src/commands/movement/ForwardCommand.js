const BaseCommand = require("../base/BaseCommand");

class ForwardCommand extends BaseCommand {
  constructor() {
    super({
      name: "forward",
      aliases: ["前"],
      description: "指定した秒数だけ前進します。使用法: forward [秒数]",
    });
  }

  async run(bot, username, args) {
    const duration = (args[0] ? parseInt(args[0], 10) : 3) * 1000;
    bot.clearControlStates();
    bot.setControlState("forward", true);
    bot.chat(`前進します...`);

    setTimeout(() => {
      bot.setControlState("forward", false);
      bot.chat("停止しました。");
    }, duration);
  }
}

module.exports = ForwardCommand;
