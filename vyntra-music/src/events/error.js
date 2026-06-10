/**
 * Vyntra Music Bot - Error Event
 * Handles Discord client errors to prevent crashes.
 */

const logger = require('../utils/logger');

module.exports = {
  name: 'error',
  once: false,

  execute(error) {
    logger.error(`[Client] Discord client error: ${error.message}\n${error.stack}`);
  },
};
