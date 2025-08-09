class ResourceManager {
  constructor(bot) {
    this.bot = bot;
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30秒
  }

  getCachedBlocks(type, maxDistance) {
    const key = `${type}_${maxDistance}`;
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const blocks = this.bot.findBlocks({
      matching: type,
      maxDistance: maxDistance,
      count: 100,
    });

    this.cache.set(key, {
      data: blocks,
      timestamp: Date.now(),
    });

    return blocks;
  }
}

module.exports = ResourceManager;
