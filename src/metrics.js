class MetricsCollector {
  constructor() {
    this.commandStats = new Map();
    this.errorCounts = new Map();
  }

  recordCommand(command, duration, success) {
    const key = command;
    const stats = this.commandStats.get(key) || {
      count: 0,
      totalTime: 0,
      errors: 0,
    };

    stats.count++;
    stats.totalTime += duration;
    if (!success) stats.errors++;

    this.commandStats.set(key, stats);
  }

  getReport() {
    const report = {};
    for (const [command, stats] of this.commandStats.entries()) {
      report[command] = {
        count: stats.count,
        averageTime: stats.totalTime / stats.count,
        errorRate: stats.errors / stats.count,
      };
    }
    return report;
  }
}

module.exports = MetricsCollector;
