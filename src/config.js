require('dotenv').config();

module.exports = {
  botOptions: {
    host: process.env.BOT_HOST || 'localhost',
    port: process.env.BOT_PORT || 25565,
    username: process.env.BOT_USERNAME || 'MinecraftBot',
    password: process.env.BOT_PASSWORD, // MSアカウントのパスワード。ない場合は省略
  },
  DEBUG: false,
  VERBOSE_CHAT: false,

  // 時間設定 (ミリ秒)
  reconnectDelay: 5000,
  jumpTimeout: 300,
  diggingDelay: 500,
  itemCollectDelay: 500,
  chestCloseDelay: 3000,
  buildStepDelay: 1000,
  wallBuildStepDelay: 400,
  floorBuildStepDelay: 300,
  followLoopInterval: 1000,

  // 探索範囲
  mobSearchRadius: 20,
  chestSearchRadius: 8,
  itemCollectRadius: 20,
  mineBlockDistance: 32,
  mineBlockCount: 10, // 追加: 採掘するブロックのデフォルト数

  // 建築設定
  towerHeight: 5,
  wallLength: 5,
  floorSize: 3,
  wallHeight: 3,
};
