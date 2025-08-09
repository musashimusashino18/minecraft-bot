const { pathfinder, Movements } = require("mineflayer-pathfinder");
const logger = require("../logger");

module.exports = (bot) => {
  bot.on("spawn", () => {
    logger.info("🎮 ワールドにスポーンしました");

    // プラグインと設定をロード
    bot.loadPlugin(pathfinder);
    const mcData = require("minecraft-data")(bot.version);
    const movements = new Movements(bot, mcData);
    bot.pathfinder.setMovements(movements);

    // 頻繁にアクセスするデータをボットオブジェクトに格納
    bot.mcData = mcData;
    bot.movements = movements;

    logger.info(
      `📍 初期位置: x=${Math.floor(bot.entity.position.x)}, y=${Math.floor(bot.entity.position.y)}, z=${Math.floor(bot.entity.position.z)}`,
    );
    logger.info(`❤️  体力: ${bot.health}/20, 🍖 空腹度: ${bot.food}/20`);
  });
};
