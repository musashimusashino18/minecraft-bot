const BaseState = require('./BaseState');

class MovingState extends BaseState {
  constructor(stateManager) {
    super(stateManager);
  }

  async enter(context) {
    await super.enter(context);
    const goal = context.goal;

    if (!goal) {
      this.bot.logger.warn('MovingStateにgoalが指定されませんでした。');
      this.stateManager.transitionTo('idle');
      return;
    }

    try {
      await this.bot.pathfinder.goto(goal);
      this.bot.chat('目標に到達しました。');
    } catch (err) {
      this.bot.chat(`移動中にエラーが発生しました: ${err.message}`);
    } finally {
      if (this.stateManager.currentStateName === 'moving') {
        this.stateManager.transitionTo('idle');
      }
    }
  }

  async interrupt(reason) {
    this.bot.pathfinder.stop();
    await super.interrupt(reason);
  }
}

module.exports = MovingState;
