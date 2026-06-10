/**
 * Vyntra Music Bot - Event Handler
 * Loads all event listeners from the events directory.
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Loads all event files from the events directory and registers them on the client.
 * @param {Client} client - Discord.js client instance.
 */
async function loadEvents(client) {
  const eventsPath = path.join(__dirname, '..', 'events');
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith('.js'));

  let loaded = 0;

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);

    try {
      const event = require(filePath);

      if (!event.name || !event.execute) {
        logger.warn(`[EventLoader] Skipping ${file}: missing 'name' or 'execute' export.`);
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }

      logger.debug(`[EventLoader] Registered event: ${event.name}`);
      loaded++;
    } catch (error) {
      logger.error(`[EventLoader] Failed to load ${file}: ${error.message}`);
    }
  }

  logger.info(`[EventLoader] Registered ${loaded} events.`);
}

module.exports = { loadEvents };
