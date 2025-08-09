// src/services/BlockService.js
class BlockService {
  constructor(bot, cacheManager) {
    this.bot = bot;
    this.cache = cacheManager;
  }

  /**
   * Finds blocks of a given type near the bot, with optional caching.
   * @param {string} type - The name of the block type to find.
   * @param {number} maxDistance - The maximum distance to search.
   * @param {boolean} useCache - Whether to use the cache.
   * @returns {Promise<Vec3[]> | Vec3[]}> - An array of block vectors.
   */
  async findBlocks(type, maxDistance = 32, useCache = true) {
    // The cache key is based on the block type, distance, and the bot's current chunk.
    const cacheKey = `${type}_${maxDistance}_${Math.floor(this.bot.entity.position.x / 16)}_${Math.floor(this.bot.entity.position.z / 16)}`;

    if (useCache) {
      const cached = this.cache.get("blocks", cacheKey);
      if (cached) {
        return cached;
      }
    }

    // findBlocks is synchronous in mineflayer, but we keep this async for future compatibility
    // or if the underlying implementation becomes async.
    const blockType = this.bot.mcData.blocksByName[type];
    if (!blockType) {
      return [];
    }

    const blocks = this.bot.findBlocks({
      matching: blockType.id,
      maxDistance,
      count: 100, // Limit the count to avoid performance issues
    });

    this.cache.set("blocks", cacheKey, blocks, 15000); // 15秒キャッシュ
    return blocks;
  }
}

module.exports = BlockService;
