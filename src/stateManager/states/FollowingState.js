const BaseState = require('./BaseState');
const { GoalFollow } = require('mineflayer-pathfinder').goals;

class FollowingState extends BaseState {
  constructor(stateManager) {
    super(stateManager);
    this.isFollowing = false;
  }

  async enter(context) {
    await super.enter(context);
    const target = context.target;

    if (!target) {
      this.bot.logger.warn('FollowingStateにtargetが指定されませんでした。');
      this.stateManager.transitionTo('idle');
      return;
    }

    this.bot.chat(
      `${target.username}さんをフォローします！「stop」で停止します。`
    );
    this.bot.pathfinder.setGoal(new GoalFollow(target, 3), true);
    this.isFollowing = true;
  }

  async interrupt(reason) {
    this.isFollowing = false;
    this.bot.pathfinder.stop();
    await super.interrupt(reason);
  }

  async exit() {
    if (this.isFollowing) {
      this.bot.pathfinder.stop();
      this.isFollowing = false;
    }
    this.bot.chat('フォローを停止しました。');
  }
}

module.exports = FollowingState;
