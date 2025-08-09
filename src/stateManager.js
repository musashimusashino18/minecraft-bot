const IdleState = require('./stateManager/states/IdleState');
const MovingState = require('./stateManager/states/MovingState');
const MiningState = require('./stateManager/states/MiningState');
const BuildingState = require('./stateManager/states/BuildingState');
const FollowingState = require('./stateManager/states/FollowingState');
const CollectingState = require('./stateManager/states/CollectingState');

class StateManager {
  constructor(bot) {
    this.bot = bot;
    this.currentStateName = 'idle';
    this.taskQueue = [];
    this.stateHistory = [];
    this.maxHistorySize = 10;

    this.states = {
      idle: new IdleState(this),
      moving: new MovingState(this),
      mining: new MiningState(this),
      building: new BuildingState(this),
      following: new FollowingState(this),
      collecting: new CollectingState(this),
    };

    this.currentState = this.states[this.currentStateName];
  }

  async transitionTo(stateName, context = {}) {
    const oldStateName = this.currentStateName;
    const oldState = this.currentState;

    if (!this.states[stateName]) {
      throw new Error(`Unknown state: ${stateName}`);
    }

    if (oldState && typeof oldState.exit === 'function') {
      await oldState.exit();
    }

    this.currentStateName = stateName;
    this.currentState = this.states[stateName];
    this.addToHistory(oldStateName, stateName, context);

    if (this.currentState && typeof this.currentState.enter === 'function') {
      await this.currentState.enter(context);
    }

    this.bot.emit('stateChanged', {
      from: oldStateName,
      to: stateName,
      context,
    });
  }

  addToHistory(from, to, context) {
    this.stateHistory.push({ from, to, context, timestamp: new Date() });
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
  }

  isBusy() {
    return this.currentStateName !== 'idle';
  }

  get currentTask() {
    return this.currentStateName;
  }

  canExecute(commandName) {
    if (!this.currentState) return false;
    return this.currentState.canExecute(commandName);
  }

  async interrupt(reason = 'user_request') {
    if (this.currentStateName !== 'idle') {
      if (
        this.currentState &&
        typeof this.currentState.interrupt === 'function'
      ) {
        await this.currentState.interrupt(reason);
      }
      await this.transitionTo('idle');
    }
  }
}

module.exports = StateManager;
