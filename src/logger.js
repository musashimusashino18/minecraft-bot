// src/logger.js の改善
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, errors, json, colorize, printf } = format;

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json(),
    // カスタムフォーマット追加
    format((info) => {
      if (info.context) {
        info.message = `[${info.context}] ${info.message}`;
      }
      return info;
    })(),
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        printf(({ level, message, timestamp, stack }) => {
          return `${timestamp} [${level}] ${message}${stack ? "\n" + stack : ""}`;
        }),
      ),
    }),
    new transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxfiles: 5,
    }),
    new transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

module.exports = logger;
