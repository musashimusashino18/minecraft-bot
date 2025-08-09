// src/commandLoader.js の改善
const fs = require('fs');
const path = require('path');

function loadCommands(bot) {
  bot.commands = new Map();
  const commandFolders = fs
    .readdirSync(path.join(__dirname, 'commands'))
    .filter((folder) =>
      fs.statSync(path.join(__dirname, 'commands', folder)).isDirectory()
    );

  for (const folder of commandFolders) {
    const commandFiles = fs
      .readdirSync(path.join(__dirname, 'commands', folder))
      .filter((file) => file.endsWith('.js') && file !== 'BaseCommand.js');

    for (const file of commandFiles) {
      try {
        const CommandClass = require(
          path.join(__dirname, 'commands', folder, file)
        );
        const command = new CommandClass();
        bot.commands.set(command.name, command);
        if (command.aliases) {
          command.aliases.forEach((alias) => bot.commands.set(alias, command));
        }
      } catch (error) {
        console.error(`コマンドの読み込みに失敗しました: ${file}`, error);
      }
    }
  }
}

module.exports = { loadCommands };
