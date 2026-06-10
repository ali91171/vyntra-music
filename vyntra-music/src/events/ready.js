/**
 * Vyntra Music Bot - Ready Event
 * Fires once the bot is connected and ready.
 */

const { ActivityType, REST, Routes } = require('discord.js');
const config = require('../config/config');
const logger = require('../utils/logger');

const activityTypeMap = {
  PLAYING: ActivityType.Playing,
  LISTENING: ActivityType.Listening,
  WATCHING: ActivityType.Watching,
  COMPETING: ActivityType.Competing,
};

module.exports = {
  name: 'ready',
  once: true,

  async execute(client) {
    logger.info('═'.repeat(50));
    logger.info(`  ${config.bot.name} v${config.bot.version} is online!`);
    logger.info(`  Logged in as: ${client.user.tag}`);
    logger.info(`  Serving ${client.guilds.cache.size} server(s)`);
    logger.info(`  ${client.users.cache.size} users in cache`);
    logger.info('═'.repeat(50));

    // Set bot activity/presence
    const activityType = activityTypeMap[config.bot.activity.type] ?? ActivityType.Listening;
    client.user.setPresence({
      activities: [
        {
          name: config.bot.activity.name,
          type: activityType,
        },
      ],
      status: 'online',
    });

    // Auto-deploy slash commands if GUILD_ID is set (dev mode)
    if (process.env.GUILD_ID) {
      await autoDeployCommands(client);
    }
  },
};

/**
 * Automatically deploys commands to the configured guild on startup.
 * This is convenient for development. In production, run deployCommands.js manually.
 */
async function autoDeployCommands(client) {
  const TOKEN = process.env.TOKEN;
  const CLIENT_ID = process.env.CLIENT_ID;
  const GUILD_ID = process.env.GUILD_ID;

  if (!TOKEN || !CLIENT_ID || !GUILD_ID) return;

  try {
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    const commands = [...client.commands.values()].map((cmd) => cmd.data.toJSON());

    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });

    logger.info(`[AutoDeploy] Deployed ${commands.length} slash commands to guild ${GUILD_ID}.`);
  } catch (error) {
    logger.error(`[AutoDeploy] Failed to deploy commands: ${error.message}`);
  }
}
