/**
 * Vyntra Music Bot - Logger Utility
 * Centralized logging using Winston with colored console output.
 */

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, colorize, printf, errors } = format;
const path = require('path');
const config = require('../config/config');

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  return stack ? `${prefix} ${message}\n${stack}` : `${prefix} ${message}`;
});

// Build transport list
const transportList = [
  new transports.Console({
    format: combine(
      colorize({ all: config.logging.colorize }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      logFormat
    ),
  }),
];

// Optionally log to files
if (config.logging.logToFile) {
  const fs = require('fs');
  if (!fs.existsSync(config.logging.logDir)) {
    fs.mkdirSync(config.logging.logDir, { recursive: true });
  }

  transportList.push(
    new transports.File({
      filename: path.join(config.logging.logDir, 'error.log'),
      level: 'error',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
      ),
    }),
    new transports.File({
      filename: path.join(config.logging.logDir, 'combined.log'),
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
      ),
    })
  );
}

const logger = createLogger({
  level: config.logging.level,
  transports: transportList,
  exitOnError: false,
});

module.exports = logger;
