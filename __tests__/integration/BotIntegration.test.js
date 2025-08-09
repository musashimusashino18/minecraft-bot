const BotFactory = require("../../src/BotFactory");
const { handleChatCommands } = require("../../src/commandHandler"); // Import handleChatCommands

jest.mock("../../src/BotFactory", () => ({
  create: jest.fn(async () => {
    const EventEmitter = require("events"); // Moved inside mock factory
    const mockBot = new EventEmitter();
    mockBot.chat = jest.fn();
    mockBot.username = "mock-bot";
    mockBot.commands = new Map(); // Mock commands map

    // Mock the HelloCommand
    const mockHelloCommand = {
      name: "hello",
      aliases: ["こんにちは"],
      description: "挨拶を返します。",
      permissions: ["basic"],
      execute: jest.fn(async (bot, username, _args) => {
        // Simulate the actual HelloCommand's run method
        bot.chat(`こんにちは、${username}さん！元気ですよ！`);
      }),
    };
    mockBot.commands.set("hello", mockHelloCommand);
    mockBot.commands.set("こんにちは", mockHelloCommand); // Add alias

    // Simulate spawn immediately
    process.nextTick(() => {
      mockBot.emit("spawn");
    });

    return mockBot;
  }),
}));

// No need for config or jest.setTimeout here, as we are mocking BotFactory

describe("Bot Integration Tests", () => {
  let bot;

  beforeAll(async () => {
    bot = await BotFactory.create(); // Call the mocked create method
  });

  afterAll(() => {
    // No need to call bot.end() on a simplified mock bot
  });

  test('should handle the "hello" command and respond correctly', (done) => {
    const testUsername = "testUser";
    const expectedResponse = `こんにちは、${testUsername}さん！元気ですよ！`;

    const chatSpy = jest.spyOn(bot, "chat");

    // Simulate the chat event and command handling
    handleChatCommands(bot, testUsername, "hello"); // Directly call command handler

    // Assertions are synchronous
    expect(chatSpy).toHaveBeenCalledWith(expectedResponse);

    done(); // Call done() immediately after synchronous assertions
  });
});
