const { handleChatCommands } = require("../../src/commandHandler"); // Import handleChatCommands

describe("Bot Integration Tests", () => {
  let bot; // This will be our mockBot
  let mockChatFn; // Declare mockChatFn here

  beforeAll(async () => {
    mockChatFn = jest.fn(); // Create the mock function once

    bot = {
      username: "mock-bot",
      chat: mockChatFn, // Assign the single mock function
      commands: new Map(),
      stateManager: {
        isBusy: jest.fn(() => false),
        canExecute: jest.fn(() => true),
        currentTask: "idle",
      },
      errorHandler: {
        handle: jest.fn(),
      },
      metrics: {
        recordCommand: jest.fn(),
      },
      // Explicitly mock event emitter methods
      _events: {},
      on: jest.fn((event, listener) => {
        if (!bot._events[event]) bot._events[event] = [];
        bot._events[event].push(listener);
      }),
      once: jest.fn((event, listener) => {
        const onceListener = (...args) => {
          listener(...args);
          bot.removeListener(event, onceListener);
        };
        bot.on(event, onceListener);
      }),
      emit: jest.fn((event, ...args) => {
        if (bot._events[event]) {
          bot._events[event].forEach((listener) => listener(...args));
        }
      }),
      removeListener: jest.fn((event, listener) => {
        if (bot._events[event]) {
          bot._events[event] = bot._events[event].filter((l) => l !== listener);
        }
      }),
    };

    const mockHelloCommand = {
      name: "hello",
      aliases: ["こんにちは"],
      description: "挨拶を返します。",
      permissions: ["basic"],
      execute: jest.fn(async (botInstance, username, _args) => {
        botInstance.chat(`こんにちは、${username}さん！元気ですよ！`);
      }),
    };
    bot.commands.set("hello", mockHelloCommand);
    bot.commands.set("こんにちは", mockHelloCommand);
  });

  afterAll(() => {
    // No need to call bot.end() on a simplified mock bot
  });

  test('should handle the "hello" command and respond correctly', (done) => {
    const testUsername = "testUser";
    const expectedResponse = `こんにちは、${testUsername}さん！元気ですよ！`;

    handleChatCommands(bot, testUsername, "hello");

    expect(mockChatFn).toHaveBeenCalledWith(expectedResponse);
    done();
  });
});
