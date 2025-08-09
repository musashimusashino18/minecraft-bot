require("dotenv").config();
const BotFactory = require("./src/BotFactory");
// const connectionConfig = require("./config/default.json"); // Removed

async function main() {
  console.log("Creating bot...");
  let bot; // Declare bot outside try-catch for shutdown
  try {
    // The factory now handles config loading internally.
    // Pass only options for plugins or specific overrides if needed.
    bot = await BotFactory.create({
      plugins: [
        // Example plugins from user's BotFactory example
        "autoFarm",
        "pathfinding",
        "inventory",
      ],
    });
    console.log(`Bot '${bot.username}' created and connected.`);

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      console.log("SIGINT received. Shutting down bot...");
      await BotFactory.shutdown(bot);
      process.exit(0);
    });
    process.on("SIGTERM", async () => {
      console.log("SIGTERM received. Shutting down bot...");
      await BotFactory.shutdown(bot);
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to create bot:", error);
    if (bot) {
      // Attempt shutdown if bot was partially created
      await BotFactory.shutdown(bot);
    }
    process.exit(1); // Exit with error code
  }
}

main();
