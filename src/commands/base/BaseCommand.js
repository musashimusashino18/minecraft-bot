const { PermissionError, CooldownError } = require("../../errors/BotError");

// src/commands/base/BaseCommand.js
class BaseCommand {
  constructor(config) {
    this.name = config.name;
    this.aliases = config.aliases || [];
    this.description = config.description;
    this.permissions = config.permissions || ["basic"];
    this.cooldown = config.cooldown || 0;
    this.validators = config.validators || [];
  }

  async validate(bot, username, args) {
    // 権限チェック
    if (!this.hasPermission(username)) {
      throw new PermissionError(`権限が不足しています: ${this.name}`);
    }

    // クールダウンチェック
    if (this.isInCooldown(username)) {
      const remaining = this.getRemainingCooldown(username);
      throw new CooldownError(`${remaining}秒後に再実行できます`);
    }

    // カスタムバリデータ実行
    for (const validator of this.validators) {
      await validator(bot, username, args);
    }
  }

  async execute(bot, username, args) {
    await this.validate(bot, username, args);
    this.startCooldown(username);
    return await this.run(bot, username, args);
  }

  // サブクラスで実装
  async run(_bot, _username, _args) {
    throw new Error("Subclasses must implement run method");
  }

  hasPermission(_username) {
    // Implement permission logic here. For now, always return true.
    return true;
  }

  isInCooldown(_username) {
    // Implement cooldown logic here. For now, always return false.
    return false;
  }

  getRemainingCooldown(_username) {
    // Implement cooldown logic here. For now, return 0.
    return 0;
  }

  startCooldown(_username) {
    // Implement cooldown logic here. For now, do nothing.
  }
}

module.exports = BaseCommand;
