// src/errors/BotError.js
class BotError extends Error {
  constructor(message, context = {}, recoverable = false) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
    this.recoverable = recoverable;
    this.timestamp = new Date();
  }

  getUserMessage() {
    return this.message;
  }

  getLogData() {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
      recoverable: this.recoverable,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

class MovementError extends BotError {
  constructor(message, originalError) {
    super(message, { originalError }, true);
  }

  getUserMessage() {
    return " 移動に失敗しました。再試行してください。";
  }
}

class ValidationError extends BotError {
  getUserMessage() {
    return `❌ ${this.message}`;
  }
}

// BaseCommandで必要となる未定義のエラークラス
class PermissionError extends BotError {
  constructor(message) {
    super(message, {}, false); // 回復不能
  }
  getUserMessage() {
    return `🚫 ${this.message}`;
  }
}

class CooldownError extends BotError {
  constructor(message) {
    super(message, {}, false); // 回復不能
  }
  getUserMessage() {
    return `⏱️ ${this.message}`;
  }
}

module.exports = {
  BotError,
  MovementError,
  ValidationError,
  PermissionError,
  CooldownError,
};
