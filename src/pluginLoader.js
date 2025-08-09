// src/pluginLoader.js
const logger = require("./logger");

class PluginLoader {
  constructor(bot) {
    this.bot = bot;
    this.plugins = new Map();
  }

  async loadPlugin(pluginName) {
    try {
      const PluginClass = require(`./plugins/${pluginName}`);
      const plugin = new PluginClass(this.bot);
      await plugin.initialize();
      this.plugins.set(pluginName, plugin);
      return true;
    } catch (error) {
      logger.error(`プラグインロードエラー [${pluginName}]:`, error);
      return false;
    }
  }
}

module.exports = PluginLoader;
