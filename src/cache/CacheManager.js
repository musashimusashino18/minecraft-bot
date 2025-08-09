// src/cache/CacheManager.js
class CacheManager {
  constructor(bot) {
    this.bot = bot;
    this.caches = new Map();
    this.defaultTtl = 30000; // 30秒

    // 定期的なクリーンアップ
    this.cleanupInterval = setInterval(() => this.cleanup(), 10000);

    // ボット終了時にクリーンアップタイマーを停止
    this.bot.once('end', () => this.stopCleanup());
  }

  getCache(name) {
    if (!this.caches.has(name)) {
      this.caches.set(name, new Map());
    }
    return this.caches.get(name);
  }

  set(cacheName, key, value, ttl = this.defaultTtl) {
    const cache = this.getCache(cacheName);
    cache.set(key, {
      value,
      expires: Date.now() + ttl,
    });
  }

  get(cacheName, key) {
    const cache = this.getCache(cacheName);
    const item = cache.get(key);

    if (!item) return null;

    if (Date.now() > item.expires) {
      cache.delete(key);
      return null;
    }

    return item.value;
  }

  cleanup() {
    const now = Date.now();
    for (const cache of this.caches.values()) {
      for (const [key, item] of cache.entries()) {
        if (now > item.expires) {
          cache.delete(key);
        }
      }
    }
  }

  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

module.exports = CacheManager;
