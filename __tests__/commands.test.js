const { handleChatCommands } = require("../src/commandHandler");

describe("Command Handler", () => {
  let mockBot;
  let mockHelloCommand;
  let mockChatFn; // Declare mockChatFn here

  beforeEach(() => {
    mockChatFn = jest.fn(); // Create the mock function once

    mockBot = {
      username: "mock-bot",
      chat: mockChatFn, // Assign the single mock function
      commands: new Map(),
      stateManager: {
        isBusy: jest.fn(() => false),
        canExecute: jest.fn(() => true),
      },
      errorHandler: {
        handle: jest.fn(),
      },
      metrics: {
        recordCommand: jest.fn(),
      },
      once: jest.fn(), // Mock for bot.once
      removeListener: jest.fn(), // Mock for bot.removeListener
    };

    mockHelloCommand = {
      name: "hello",
      aliases: ["こんにちは"],
      description: "挨拶を返します。",
      permissions: ["basic"],
      execute: jest.fn(async (botInstance, username, _args) => {
        botInstance.chat(`こんにちは、${username}さん！元気ですよ！`);
      }),
      }),
    };
    mockBot.commands.set("hello", mockHelloCommand);
    mockBot.commands.set("こんにちは", mockHelloCommand);
  });

  test("should respond to hello command", () => {
    const testUsername = "testUser";
    const expectedResponse = "こんにちは、" + testUsername + "さん！元気ですよ！";

    handleChatCommands(mockBot, testUsername, "hello");
    expect(mockChatFn).toHaveBeenCalledWith(expectedResponse);
    // console.log('DEBUG: mockChatFn.mock.calls:', mockChatFn.mock.calls); // Removed debug log
  });
});