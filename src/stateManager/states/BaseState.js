// src/stateManager/states/BaseState.js
class BaseState {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.bot = stateManager.bot;
    this.allowedCommands = ["stop", "help", "pos", "health"];
  }

  async enter(context) {
    this.context = context;
  }

  async exit() {
    // サブクラスでクリーンアップ処理を実装
  }

  canExecute(commandName) {
    return this.allowedCommands.includes(commandName);
  }

  async interrupt(_reason) {
    // デフォルトでは何もしない
  }
}

module.exports = BaseState;
