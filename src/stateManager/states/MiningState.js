const BaseState = require("./BaseState");
const { safeDig } = require("../../utils");

class MiningState extends BaseState {
  constructor(stateManager) {
    super(stateManager);
    this.allowedCommands = [...this.allowedCommands, "inv"];
    this.isMining = false;
  }

  async enter(context) {
    await super.enter(context);
    this.isMining = true;

    this.mine(context.blockName, context.count).finally(() => {
      this.isMining = false;
      if (this.stateManager.currentStateName === "mining") {
        this.stateManager.transitionTo("idle");
      }
    });
  }

  async mine(blockName, count) {
    const bot = this.bot;
    const config = bot.config || {};

    try {
      const blockType = bot.mcData.blocksByName[blockName];
      if (!blockType) {
        throw new Error(`ブロック「${blockName}」が見つかりません`);
      }

      const blocks = bot.findBlocks({
        matching: blockType.id,
        maxDistance: config.mineBlockDistance || 64,
        count: count * 5,
      });

      const validBlocks = blocks.slice(0, count);

      if (validBlocks.length === 0) {
        throw new Error(`近くに${blockName}が見つかりません`);
      }

      bot.chat(`${validBlocks.length}個の${blockName}を採掘します...`);

      for (let i = 0; i < validBlocks.length; i++) {
        if (!this.isMining) {
          bot.chat("採掘が中断されました");
          return;
        }

        const block = bot.blockAt(validBlocks[i]);
        if (!block) continue;

        await safeDig(bot, block);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      bot.chat("採掘完了！");
    } catch (error) {
      console.log(
        "MiningState: In catch block. Is bot.errorHandler defined?",
        !!bot.errorHandler,
      );
      bot.errorHandler.handle(error, "mining");
    }
  }

  async interrupt(reason) {
    this.isMining = false;
    this.bot.chat(`⚠️ 採掘が中断されました (理由: ${reason})`);
    await this.exit();
  }

  async exit() {
    this.bot.chat("採掘作業を終了しました。");
  }
}

module.exports = MiningState;
