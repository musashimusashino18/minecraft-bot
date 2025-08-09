const BaseCommand = require("../base/BaseCommand");
const { ValidationError } = require("../../errors/BotError");
const { GoalBlock } = require("mineflayer-pathfinder").goals;

class GotoCommand extends BaseCommand {
  constructor() {
    super({
      name: "goto",
      aliases: ["移動"],
      description: "指定した座標に移動します。使用法: goto <x> <y> <z>",
      validators: [
        (bot, username, args) => {
          if (args.length < 3) {
            throw new ValidationError("座標を3つ指定してください: x y z");
          }
          const coords = args.slice(0, 3).map(Number);
          if (coords.some(isNaN)) {
            throw new ValidationError("無効な座標です");
          }
        },
      ],
    });
  }

  async run(bot, username, args) {
    if (bot.stateManager.isBusy()) {
      bot.chat("現在、他の作業を実行中です。");
      return;
    }
    const [x, y, z] = args.map(Number);
    bot.chat(`座標 (${x}, ${y}, ${z}) に移動します`);
    bot.stateManager.transitionTo("moving", { goal: new GoalBlock(x, y, z) });
  }
}

module.exports = GotoCommand;
