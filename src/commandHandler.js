// src/commandHandler.js の改善

async function handleChatCommands(bot, username, message) {
  if (username === bot.username) return;

  const args = message.toLowerCase().trim().split(/\s+/);
  const commandName = args.shift();
  const command = bot.commands.get(commandName);

  if (command) {
    try {
      // StateManagerが実装されるまで、このチェックは無効化します。
      if (bot.stateManager && typeof bot.stateManager.isBusy === "function") {
        if (
          bot.stateManager.isBusy() &&
          !bot.stateManager.canExecute(command.name)
        ) {
          bot.chat(
            `現在「${bot.stateManager.currentTask}」を実行中です。「stop」で停止できます。`,
          );
          return;
        }
      }

      // command.execute は BaseCommand で定義済み
      await command.execute(bot, username, args);
    } catch (error) {
      // bot.errorHandlerインスタンスを使ってエラーを処理します。
      if (bot.errorHandler && typeof bot.errorHandler.handle === "function") {
        bot.errorHandler.handle(error, `コマンド実行エラー [${command.name}]`);
      } else {
        // フォールバック
        console.error(`コマンド実行エラー [${command.name}]`, error);
        bot.chat("エラーが発生しました。詳細はログを確認してください。");
      }
    }
  }
}

module.exports = { handleChatCommands };
