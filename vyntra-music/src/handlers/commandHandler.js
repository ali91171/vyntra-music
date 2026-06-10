/**
 * Vyntra Music Bot - Command Handler
 * Loads all slash commands from the commands directory into the client.
 */

const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Loads all commands from the commands directory into client.commands.
 * @param {Client} client - Discord.js client instance.
 */
async function loadCommands(client) {
  client.commands = new Collection();

  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));

  let loaded = 0;
  let failed = 0;

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    try {
      const command = require(filePath);

      if (!command.data || !command.execute) {
        logger.warn(`[CommandLoader] Skipping ${file}: missing 'data' or 'execute' export.`);
        failed++;
        continue;
      }

      client.commands.set(command.data.name, command);
      logger.debug(`[CommandLoader] Loaded command: /${command.data.name}`);
      loaded++;
    } catch (error) {
      logger.error(`[CommandLoader] Failed to load ${file}: ${error.message}`);
      failed++;
    }
  }

  logger.info(`[CommandLoader] Loaded ${loaded} commands. ${failed > 0 ? `(${failed} failed)` : ''}`);
}

module.exports = { loadCommands };
