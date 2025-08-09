const fs = require("fs");
const path = require("path");

module.exports = (bot) => {
  const eventsPath = path.join(__dirname, "events");
  fs.readdirSync(eventsPath).forEach((file) => {
    if (file.endsWith(".js")) {
      const eventHandler = require(path.join(eventsPath, file));
      eventHandler(bot); // 各イベントハンドラ関数にbotインスタンスを渡して実行
    }
  });
};
