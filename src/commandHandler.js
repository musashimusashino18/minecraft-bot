const logger = require('./logger');

class CommandHandler {
  constructor(bot) {
    this.bot = bot;
    this.commandCooldowns = new Map();
    this.userCommandCounts = new Map();
    this.rateLimitWindow = 60 * 1000; // 1分
    this.maxCommandsPerWindow = 30;
    this.globalCooldown = 1000; // 1秒
    this.lastCommandTime = 0;

    // Only set up cleanup if not in a test environment
    if (process.env.NODE_ENV !== 'test') {
      this.cleanupInterval = null;
      this.setupCleanup();
    }
  }

  setupCleanup() {
    if (!this.cleanupInterval) {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 300000); // 5分ごと

      // Listen for bot end event to stop cleanup
      this.bot.once('end', () => {
        if (this.cleanupInterval) {
          clearInterval(this.cleanupInterval);
          this.cleanupInterval = null;
        }
      });
    }
  }

  async handleChatCommands(username, message) {
    // 基本的な前処理
    if (!this.isValidInput(username, message)) {
      return;
    }

    try {
      // レート制限チェック
      if (!this.checkRateLimit(username)) {
        this.bot.chat(`⚠️ ${username}さん、コマンドの送信が早すぎます。少し待ってからもう一度お試しください。`);
        return;
      }

      // グローバルクールダウンチェック
      if (!this.checkGlobalCooldown()) {
        return; // サイレントに無視
      }

      // コマンドの解析
      const parsedCommand = this.parseCommand(message);
      if (!parsedCommand) {
        return;
      }

      // コマンドの実行
      await this.executeCommand(username, parsedCommand);

    } catch (error) {
      await this.handleCommandError(error, username, message);
    }
  }

  isValidInput(username, message) {
    // 自分のメッセージは無視
    if (username === this.bot.username) {
      return false;
    }

    // 空のメッセージや無効な文字列をチェック
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return false;
    }

    // メッセージの長さ制限
    if (message.length > 256) {
      this.bot.chat(`❌ ${username}さん、コマンドが長すぎます。`);
      return false;
    }

    // 危険な文字のチェック
    if (this.containsMaliciousContent(message)) {
      logger.warn(`Potentially malicious command from ${username}: ${message}`);
      return false;
    }

    return true;
  }

  containsMaliciousContent(message) {
    // 基本的な危険パターンをチェック
    const dangerousPatterns = [
      /\.\./g,           // パストラバーサル
      /[<>]/g,           // HTMLタグ
      /javascript:/i,    // JavaScriptスキーム
      /eval\(/i,         // eval関数
      /exec\(/i,         // exec関数
      /system\(/i,       // system関数
      /\$\{/g,           // テンプレートリテラル
      /`/g               // バッククォート
    ];

    return dangerousPatterns.some(pattern => pattern.test(message));
  }

  checkRateLimit(username) {
    const now = Date.now();
    const userCommands = this.userCommandCounts.get(username) || [];
    
    // 古いコマンドを削除（1分以上前）
    const recentCommands = userCommands.filter(time => now - time < this.rateLimitWindow);
    
    if (recentCommands.length >= this.maxCommandsPerWindow) {
      return false;
    }
    
    // 新しいコマンドを記録
    recentCommands.push(now);
    this.userCommandCounts.set(username, recentCommands);
    
    return true;
  }

  checkGlobalCooldown() {
    const now = Date.now();
    if (now - this.lastCommandTime < this.globalCooldown) {
      return false;
    }
    this.lastCommandTime = now;
    return true;
  }

  parseCommand(message) {
    try {
      const trimmed = message.toLowerCase().trim();
      const args = trimmed.split(/\s+/);
      const commandName = args.shift();

      // 空のコマンド名をチェック
      if (!commandName) {
        return null;
      }

      return {
        name: commandName,
        args: args,
        originalMessage: message
      };
    } catch (error) {
      logger.error('コマンド解析エラー:', error);
      return null;
    }
  }

  async executeCommand(username, parsedCommand) {
    const { name, args, originalMessage } = parsedCommand;
    
    // コマンドの存在確認
    const command = this.bot.commands?.get(name);
    if (!command) {
      // 存在しないコマンドは静かに無視（スパム防止）
      return;
    }

    // ログ記録
    logger.info(` ${username}: ${originalMessage}`);

    // コマンド実行前のチェック
    if (!await this.preExecutionCheck(command, username, args)) {
      return;
    }

    // コマンド実行
    const startTime = Date.now();
    try {
      await command.execute(this.bot, username, args);
      
      // 成功時のメトリクス記録
      this.recordCommandMetrics(command.name, Date.now() - startTime, true);
      
    } catch (error) {
      // コマンド実行エラー
      this.recordCommandMetrics(command.name, Date.now() - startTime, false);
      throw error;
    }
  }

  async preExecutionCheck(command, username, _args) {
    try {
      // StateManagerによる実行可能性チェック
      if (this.bot.stateManager && typeof this.bot.stateManager.isBusy === 'function') {
        if (this.bot.stateManager.isBusy() && !this.bot.stateManager.canExecute(command.name)) {
          const currentTask = this.bot.stateManager.currentTask || '不明なタスク';
          this.bot.chat(`現在「${currentTask}」を実行中です。「stop」で停止できます。`);
          return false;
        }
      }

      // コマンド固有のクールダウンチェック
      const cooldownKey = `${username}_${command.name}`;
      const lastUsed = this.commandCooldowns.get(cooldownKey);
      const cooldownTime = command.cooldown || 3000; // デフォルト3秒

      if (lastUsed && Date.now() - lastUsed < cooldownTime) {
        const remaining = Math.ceil((cooldownTime - (Date.now() - lastUsed)) / 1000);
        this.bot.chat(`⏱️ ${command.name}コマンドは${remaining}秒後に使用できます。`);
        return false;
      }

      // クールダウンを記録
      this.commandCooldowns.set(cooldownKey, Date.now());

      return true;

    } catch (error) {
      logger.error('コマンド実行前チェックでエラー:', error);
      return false;
    }
  }

  async handleCommandError(error, username, message) {
    try {
      // エラーハンドラーが利用可能な場合は使用
      if (this.bot.errorHandler && typeof this.bot.errorHandler.handle === 'function') {
        await this.bot.errorHandler.handle(error, `コマンド実行 [${username}]`, {
          username,
          command: message,
          timestamp: new Date().toISOString()
        });
      } else {
        // フォールバック処理
        logger.error(`コマンド実行エラー [${username}: ${message}]`, error);
        
        if (this.bot && typeof this.bot.chat === 'function') {
          // エラーの種類に応じてメッセージを変える
          const userMessage = this.getUserFriendlyErrorMessage(error);
          await this.bot.chat(`❌ ${username}さん: ${userMessage}`);
        }
      }
    } catch (handlingError) {
      // エラーハンドリング自体が失敗した場合
      logger.error('エラーハンドリング中にエラーが発生:', {
        original: error?.message || error,
        handling: handlingError?.message || handlingError
      });
    }
  }

  getUserFriendlyErrorMessage(error) {
    const message = error?.message || '';
    
    if (message.includes('権限')) {
      return 'このコマンドを実行する権限がありません。';
    }
    
    if (message.includes('座標')) {
      return '座標の指定に問題があります。正しい形式で入力してください。';
    }
    
    if (message.includes('アイテム')) {
      return 'アイテムが見つからないか、操作に失敗しました。';
    }
    
    if (message.includes('移動') || message.includes('pathfind')) {
      return '移動に失敗しました。障害物があるか、距離が遠すぎる可能性があります。';
    }
    
    if (message.includes('inventory') || message.includes('インベントリ')) {
      return 'インベントリ操作に失敗しました。';
    }
    
    return 'コマンドの実行に失敗しました。';
  }

  recordCommandMetrics(commandName, duration, success) {
    try {
      // メトリクス記録（将来的にはPrometheusなどに送信）
      logger.debug('Command metrics:', {
        command: commandName,
        duration,
        success,
        timestamp: new Date().toISOString()
      });
      
      // ボットにメトリクス機能がある場合は記録
      if (this.bot.metrics && typeof this.bot.metrics.recordCommand === 'function') {
        this.bot.metrics.recordCommand(commandName, duration, success);
      }
    } catch (error) {
      // メトリクス記録の失敗は致命的ではない
      logger.debug('Failed to record metrics:', error);
    }
  }

  // 統計情報の取得
  getStats() {
    const now = Date.now();
    const activeUsers = new Set();
    
    for (const [username, commands] of this.userCommandCounts.entries()) {
      const recentCommands = commands.filter(time => now - time < this.rateLimitWindow);
      if (recentCommands.length > 0) {
        activeUsers.add(username);
      }
    }

    return {
      activeUsers: activeUsers.size,
      totalUsers: this.userCommandCounts.size,
      commandCooldowns: this.commandCooldowns.size,
      timestamp: new Date().toISOString()
    };
  }

  // クリーンアップ（メモリリーク防止）
  cleanup() {
    const now = Date.now();
    
    // 古いレート制限データを削除
    for (const [username, commands] of this.userCommandCounts.entries()) {
      const recentCommands = commands.filter(time => now - time < this.rateLimitWindow);
      if (recentCommands.length === 0) {
        this.userCommandCounts.delete(username);
      } else {
        this.userCommandCounts.set(username, recentCommands);
      }
    }
    
    // 古いクールダウンデータを削除
    for (const [key, time] of this.commandCooldowns.entries()) {
      if (now - time > 300000) { // 5分以上古い
        this.commandCooldowns.delete(key);
      }
    }
  }
}

// 後方互換性のための関数エクスポート
async function handleChatCommands(bot, username, message) {
  if (!bot._commandHandler) {
    bot._commandHandler = new CommandHandler(bot);
  }
  
  await bot._commandHandler.handleChatCommands(username, message);
}

module.exports = { 
  CommandHandler,
  handleChatCommands 
};