const path = require("path");
const fs = require("fs");

class ConfigManager {
  constructor() {
    this.config = null;
    this.defaultConfig = {
      bot: {
        host: "localhost",
        port: 25565,
        username: "MinecraftBot",
        password: null,
        reconnectAttempts: 5,
        reconnectDelay: 5000,
        version: "1.21",
      },
      features: {
        autoReconnect: true,
        verboseChat: false,
        commandCooldown: 3000,
        debug: false,
      },
      limits: {
        maxBuildSize: 20,
        maxMineDistance: 32,
        maxFollowDistance: 100,
        itemCollectRadius: 16,
        mobSearchRadius: 20,
        chestSearchRadius: 8,
        maxInventorySlots: 36,
      },
      timeouts: {
        jumpTimeout: 300,
        diggingDelay: 500,
        itemCollectDelay: 500,
        chestCloseDelay: 3000,
        buildStepDelay: 1000,
        followLoopInterval: 1000,
      },
      security: {
        allowedUsers: [],
        restrictedCommands: ["mine", "build", "drop"],
        maxCommandsPerMinute: 30,
      },
      logging: {
        level: "info",
        maxFileSize: "5MB",
        maxFiles: 5,
        enableConsole: true,
        enableFile: true,
      },
    };
    this.load();
  }

  load() {
    try {
      // 環境変数から設定を読み込み
      const envConfig = this.loadFromEnvironment();

      // ファイルから設定を読み込み（存在する場合）
      const fileConfig = this.loadFromFile();

      // デフォルト設定をベースに統合
      this.config = this.mergeConfigs(
        this.defaultConfig,
        fileConfig,
        envConfig,
      );

      // 設定の妥当性チェック
      this.validate();
    } catch (error) {
      console.warn(
        "設定の読み込みに失敗しました。デフォルト設定を使用します:",
        error.message,
      );
      this.config = this.defaultConfig;
    }
  }

  loadFromEnvironment() {
    return {
      bot: {
        host: process.env.BOT_HOST,
        port: process.env.BOT_PORT
          ? parseInt(process.env.BOT_PORT, 10)
          : undefined,
        username: process.env.BOT_USERNAME,
        password: process.env.BOT_PASSWORD || undefined,
      },
      features: {
        debug: process.env.DEBUG === "true",
        verboseChat: process.env.VERBOSE_CHAT === "true",
      },
      logging: {
        level: process.env.LOG_LEVEL,
      },
    };
  }

  loadFromFile() {
    const configPath = path.join(process.cwd(), "config", "bot-config.json");
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf8");
      return JSON.parse(content);
    }
    return {};
  }

  mergeConfigs(...configs) {
    return configs.reduce((merged, config) => {
      return this.deepMerge(merged, config);
    }, {});
  }

  deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (source[key] !== null && source[key] !== undefined) {
        if (typeof source[key] === "object" && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  validate() {
    const errors = [];

    // ボット設定の検証
    if (!this.config.bot.host) {
      errors.push("Bot host is required");
    }

    if (this.config.bot.port < 1 || this.config.bot.port > 65535) {
      errors.push("Bot port must be between 1 and 65535");
    }

    if (!this.config.bot.username || this.config.bot.username.length < 3) {
      errors.push("Bot username must be at least 3 characters long");
    }

    // 制限値の検証
    if (
      this.config.limits.maxBuildSize < 1 ||
      this.config.limits.maxBuildSize > 100
    ) {
      errors.push("maxBuildSize must be between 1 and 100");
    }

    if (
      this.config.limits.maxMineDistance < 1 ||
      this.config.limits.maxMineDistance > 64
    ) {
      errors.push("maxMineDistance must be between 1 and 64");
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.join(", ")}`);
    }
  }

  get(path) {
    return this.getPath(this.config, path);
  }

  getPath(obj, path) {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  set(path, value) {
    this.setPath(this.config, path, value);
  }

  setPath(obj, path, value) {
    const keys = path.split(".");
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  reload() {
    this.load();
  }

  getAll() {
    return { ...this.config };
  }
}

module.exports = ConfigManager;
