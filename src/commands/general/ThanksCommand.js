const BaseCommand = require("../base/BaseCommand");

class ThanksCommand extends BaseCommand {
  constructor() {
    super({
      name: "thanks",
      aliases: ["thank", "ありがとう"],
      description: "感謝の言葉に返事をします。",
      permissions: ["basic"],
    });
  }

  async run(bot, username, _args) {
    bot.chat(`どういたしまして、${username}さん！`);
  }
}

module.exports = ThanksCommand;
