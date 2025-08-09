const BaseState = require("./BaseState");

class IdleState extends BaseState {
  constructor(stateManager) {
    super(stateManager);
  }
}

module.exports = IdleState;
