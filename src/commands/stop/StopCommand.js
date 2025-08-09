const BaseCommand = require("../base/BaseCommand");

class StopCommand extends BaseCommand {
  constructor() {
    super({
      name: "stop",
      aliases: ["停止", "ストップ"],
      description: "ボットの現在のアクションをすべて停止します。",
    });
  }

  async run(bot, _username, _args) {
    bot.stateManager.interrupt("user_request");
  }
}

module.exports = StopCommand;
