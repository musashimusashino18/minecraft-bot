const BaseCommand = require("../base/BaseCommand");

class FollowCommand extends BaseCommand {
  constructor() {
    super({
      name: "follow",
      aliases: ["ついてきて"],
      description:
        "指定したプレイヤーを追跡します。使用法: follow [プレイヤー名]",
    });
  }

  async run(bot, username, args) {
    if (bot.stateManager.isBusy()) {
      bot.chat("現在、他の作業を実行中です。");
      return;
    }

    const targetUsername = args[0] || username;
    const target = bot.players[targetUsername];

    if (!target || !target.entity) {
      bot.chat(`${targetUsername}さんが見つかりません`);
      return;
    }

    bot.stateManager.transitionTo("following", { target: target.entity });
  }
}

module.exports = FollowCommand;
