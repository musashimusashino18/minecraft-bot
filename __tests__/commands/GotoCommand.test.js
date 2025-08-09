const GotoCommand = require('../../src/commands/movement/GotoCommand');
const { ValidationError } = require('../../src/errors/BotError');

describe('GotoCommand', () => {
  let mockBot, command;

  beforeEach(() => {
    const mockStateManager = {
      setTask: jest.fn(),
      clearTask: jest.fn(),
      isBusy: jest.fn().mockReturnValue(false),
      transitionTo: jest.fn().mockResolvedValue(undefined),
    };

    mockBot = {
      chat: jest.fn(),
      stateManager: mockStateManager,
      pathfinder: {
        goto: jest.fn().mockResolvedValue(),
      },
    };

    command = new GotoCommand();
  });

  test('should throw ValidationError if coordinates are not numbers', async () => {
    const validator = command.validators[0];
    expect(() =>
      validator(mockBot, 'testUser', ['invalid', 'coords', 'here'])
    ).toThrow(ValidationError);
    expect(() =>
      validator(mockBot, 'testUser', ['invalid', 'coords', 'here'])
    ).toThrow('無効な座標です');
  });

  test('should throw ValidationError if not enough coordinates are provided', async () => {
    const validator = command.validators[0];
    expect(() => validator(mockBot, 'testUser', ['10', '20'])).toThrow(
      ValidationError
    );
    expect(() => validator(mockBot, 'testUser', ['10', '20'])).toThrow(
      '座標を3つ指定してください: x y z'
    );
  });

  test('should move to coordinates successfully', async () => {
    await command.run(mockBot, 'testUser', ['10', '20', '30']);

    expect(mockBot.chat).toHaveBeenCalledWith('座標 (10, 20, 30) に移動します');
    expect(mockBot.stateManager.transitionTo).toHaveBeenCalledWith('moving', {
      goal: expect.any(Object),
    });
  });
});
