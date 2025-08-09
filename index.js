require('dotenv').config();
const BotFactory = require('./src/BotFactory');
const connectionConfig = require('./config/default.json');

async function main() {
  console.log('Creating bot...');
  try {
    // The factory expects a `connection` property in the config object.
    const bot = await BotFactory.create({
      connection: connectionConfig,
      plugins: [
        // Example plugins from user's BotFactory example
        'autoFarm',
        'pathfinding',
        'inventory',
      ],
    });
    console.log(`Bot '${bot.username}' created and connected.`);
  } catch (error) {
    console.error('Failed to create bot:', error);
  }
}

main();
