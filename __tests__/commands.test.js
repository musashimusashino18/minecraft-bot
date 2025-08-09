// __tests__/commands.test.js
const { handleChatCommands } = require('../src/commandHandler');

describe('Command Handler', () => {
  let mockBot;

  beforeEach(() => {
    mockBot = {
      username: 'TestBot',
      chat: jest.fn(),
      entity: { position: { x: 0, y: 0, z: 0 } },
      health: 20,
      food: 20,
      inventory: { items: () => [] },
      stateManager: {
        // Updated to stateManager
        isBusy: jest.fn(() => false),
        canExecute: jest.fn(() => true),
        currentTask: null,
      },
      commands: new Map([
        [
          'hello',
          {
            name: 'hello',
            execute: jest.fn((bot, username, _args) => {
              bot.chat(`こんにちは、${username}さん！元気ですよ！`);
            }),
          },
        ],
      ]),
    };
  });

  test('should respond to hello command', () => {
    handleChatCommands(mockBot, 'testUser', 'hello');
    expect(mockBot.chat).toHaveBeenCalledWith(
      'こんにちは、testUserさん！元気ですよ！'
    );
  });
});
