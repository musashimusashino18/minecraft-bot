const BaseState = require("./BaseState");
const { GoalBlock } = require("mineflayer-pathfinder").goals;

class CollectingState extends BaseState {
  constructor(stateManager) {
    super(stateManager);
    this.allowedCommands = [...this.allowedCommands, "inv"];
    this.isCollecting = false;
  }

  async enter(context) {
    await super.enter(context);
    const itemName = context.itemName || "any item";
    this.bot.chat(`--- アイテム収集開始: ${itemName} ---`);
    this.isCollecting = true;

    this.collect(context.itemName).finally(() => {
      this.isCollecting = false;
      if (this.stateManager.currentStateName === "collecting") {
        this.stateManager.transitionTo("idle");
      }
    });
  }

  async collect(itemName) {
    const config = this.bot.config || {};

    const items = Object.values(this.bot.entities).filter((entity) => {
      return (
        entity.name === "item" &&
        entity.position.distanceTo(this.bot.entity.position) <
          (config.itemCollectRadius || 16) &&
        entity.metadata &&
        entity.metadata[8] &&
        (itemName
          ? entity.metadata[8].displayName
              ?.toLowerCase()
              .includes(itemName.toLowerCase()) ||
            this.bot.mcData.items[entity.metadata[8].itemId]?.name.includes(
              itemName.toLowerCase(),
            )
          : true)
      );
    });

    if (items.length === 0) {
      this.bot.chat(`${itemName || "アイテム"}が見つかりません`);
      return;
    }

    this.bot.chat(`${items.length}個のアイテムを収集します...`);

    for (const item of items) {
      if (!this.isCollecting) {
        this.bot.chat("収集が中断されました。");
        return;
      }
      try {
        const goal = new GoalBlock(
          Math.floor(item.position.x),
          Math.floor(item.position.y),
          Math.floor(item.position.z),
        );
        await this.bot.pathfinder.goto(goal);
        await new Promise((resolve) =>
          setTimeout(resolve, config.itemCollectDelay || 100),
        );
      } catch (err) {
        this.bot.logger.warn(`Could not path to item: ${err.message}`);
      }
    }
  }

  async interrupt(reason) {
    this.isCollecting = false;
    this.bot.chat(`⚠️ 収集が中断されました (理由: ${reason})`);
    await this.exit();
  }

  async exit() {
    this.bot.pathfinder.stop();
    this.bot.chat("--- アイテム収集終了 ---");
  }
}

module.exports = CollectingState;
