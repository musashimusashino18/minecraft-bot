const BaseState = require("./BaseState");
const { findBuildingMaterial } = require("../../utils");
const { Vec3 } = require("vec3");

class BuildingState extends BaseState {
  constructor(stateManager) {
    super(stateManager);
    this.isBuilding = false;
  }

  async enter(context) {
    await super.enter(context);
    this.isBuilding = true;

    this.build(context.structureType, context.size).finally(() => {
      this.isBuilding = false;
      if (this.stateManager.currentStateName === "building") {
        this.stateManager.transitionTo("idle");
      }
    });
  }

  async build(structureType, size) {
    const bot = this.bot;
    try {
      const buildMaterial = findBuildingMaterial(bot);
      if (!buildMaterial) {
        bot.chat("建築資材（石、丸石、木、土）がありません。");
        return;
      }

      bot.chat(`${buildMaterial.displayName}で${structureType}を建築します...`);

      const startPos = bot.entity.position.offset(2, 0, 0);

      if (structureType === "tower") {
        let currentPos = startPos;
        for (let i = 0; i < size; i++) {
          if (!this.isBuilding) {
            bot.chat("建築が中断されました。");
            return;
          }
          const blockBelow = bot.blockAt(currentPos.offset(0, -1, 0));
          if (!blockBelow) {
            bot.chat("建築を続けるための地面がありません。");
            return;
          }
          await bot.equip(buildMaterial, "hand");
          await bot.placeBlock(blockBelow, new Vec3(0, 1, 0));
          currentPos = currentPos.offset(0, 1, 0);
        }
      }
      bot.chat("建築完了！");
    } catch (err) {
      bot.errorHandler.handle(err, "building");
    }
  }

  async interrupt(reason) {
    this.isBuilding = false;
    this.bot.chat(`⚠️ 建築が中断されました (理由: ${reason})`);
    await this.exit();
  }

  async exit() {
    this.bot.chat("建築作業を終了しました。");
  }
}

module.exports = BuildingState;
