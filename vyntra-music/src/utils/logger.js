/**
 * Vyntra Music Bot - Logger Utility
 * Simple built-in logger (no external dependencies).
 */

const config = require('../config/config');

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const colors = {
  error: '\x1b[31m',
  warn:  '\x1b[33m',
  info:  '\x1b[36m',
  debug: '\x1b[90m',
  reset: '\x1b[0m',
};

const currentLevel = levels[config.logging.level] ?? levels.info;

function log(level, message) {
  if (levels[level] > currentLevel) return;

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const color = colors[level] || colors.reset;
  const label = level.toUpperCase().padEnd(5);

  console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
    `${color}[${timestamp}] [${label}]${colors.reset} ${message}`
  );
}

const logger = {
  error: (msg) => log('error', msg),
  warn:  (msg) => log('warn',  msg),
  info:  (msg) => log('info',  msg),
  debug: (msg) => log('debug', msg),
};

module.exports = logger;