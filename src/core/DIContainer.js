// A simple service locator / DI container
class DIContainer {
  constructor() {
    this.services = new Map();
  }
  register(name, definition) {
    this.services.set(name, definition);
  }
  resolve(name) {
    const definition = this.services.get(name);
    if (typeof definition === 'function') {
      // If it's a factory function, call it
      return definition();
    }
    return definition;
  }
}
module.exports = DIContainer;
