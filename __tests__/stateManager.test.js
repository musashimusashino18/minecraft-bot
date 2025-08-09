const StateManager = require("../src/stateManager");
const IdleState = require("../src/stateManager/states/IdleState");
const MiningState = require("../src/stateManager/states/MiningState");

// Mock the state classes
jest.mock("../src/stateManager/states/IdleState");
jest.mock("../src/stateManager/states/MiningState");

describe("StateManager", () => {
  let bot, stateManager;

  beforeEach(() => {
    // Reset mocks before each test
    IdleState.mockClear();
    MiningState.mockClear();

    // Mock the instances returned by the constructors
    IdleState.mockImplementation(() => ({
      enter: jest.fn(),
      exit: jest.fn(),
      canExecute: jest.fn(() => true), // Default to true for simplicity in this test
      interrupt: jest.fn(),
    }));
    MiningState.mockImplementation(() => ({
      enter: jest.fn(),
      exit: jest.fn(),
      canExecute: jest.fn((commandName) => {
        // Simulate BaseState and MiningState allowed commands
        const allowed = ["stop", "help", "pos", "health", "inv"];
        return allowed.includes(commandName);
      }),
      interrupt: jest.fn(),
    }));

    bot = {
      chat: jest.fn(),
      emit: jest.fn(),
      errorHandler: {
        handle: jest.fn(),
      },
    };
    stateManager = new StateManager(bot);
  });

  test("should set and clear task correctly", async () => {
    await stateManager.transitionTo("mining");
    expect(stateManager.currentTask).toBe("mining");
    expect(stateManager.isBusy()).toBe(true);
    expect(MiningState).toHaveBeenCalledTimes(1); // Ensure MiningState was instantiated
    expect(stateManager.currentState.enter).toHaveBeenCalledTimes(1); // Ensure enter was called

    await stateManager.transitionTo("idle");
    expect(stateManager.currentTask).toBe("idle");
    expect(stateManager.isBusy()).toBe(false);
    expect(stateManager.currentState.enter).toHaveBeenCalledTimes(1); // Ensure enter was called for idle state
  });

  test("should check command execution permission", async () => {
    await stateManager.transitionTo("mining");
    expect(stateManager.canExecute("build")).toBe(false); // Based on mock MiningState canExecute
    expect(stateManager.canExecute("stop")).toBe(true); // BaseState default
  });
});
