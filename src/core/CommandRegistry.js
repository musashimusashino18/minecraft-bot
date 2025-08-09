// Simple command registry
class CommandRegistry {
  constructor() {
    this.commands = new Map();
  }
  register(command) {
    this.commands.set(command.name, command);
  }
  get(commandName) {
    return this.commands.get(commandName);
  }
}
module.exports = CommandRegistry;
