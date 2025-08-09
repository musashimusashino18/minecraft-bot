class SecurityManager {
  constructor() {
    this.permissions = {
      admin: ['mine', 'build', 'drop', 'chest'],
      trusted: ['come', 'follow', 'goto'],
      basic: ['pos', 'health', 'time', 'inv'],
    };
    this.userRoles = new Map();
    this.commandCooldowns = new Map();
  }

  setUserRole(username, role) {
    this.userRoles.set(username, role);
  }

  hasPermission(username, command) {
    const role = this.userRoles.get(username) || 'basic';

    for (const [roleLevel, commands] of Object.entries(this.permissions)) {
      if (commands.includes(command)) {
        return this.hasRole(role, roleLevel);
      }
    }

    return true; // デフォルトで許可
  }

  hasRole(userRole, requiredRole) {
    const hierarchy = ['basic', 'trusted', 'admin'];
    const userIndex = hierarchy.indexOf(userRole);
    const requiredIndex = hierarchy.indexOf(requiredRole);

    return userIndex >= requiredIndex;
  }
}

module.exports = SecurityManager;
