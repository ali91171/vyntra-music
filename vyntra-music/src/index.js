/**
 * ╔══════════════════════════════════════════════════╗
 * ║           Vyntra Music Bot v1.0.0               ║
 * ║   Production-ready Discord music bot            ║
 * ║   Powered by Discord.js v14 + Discord Player    ║
 * ╚══════════════════════════════════════════════════╝
 */

// Load environment variables first
require('dotenv').config();

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const { initializePlayer } = require('./music/player');
const logger = require('./utils/logger');
const config = require('./config/config');

// ─────────────────────────────────────────────
// STARTUP VALIDATION
// ─────────────────────────────────────────────
function validateEnvironment() {
  const required = ['TOKEN', 'CLIENT_ID'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    logger.error('Please copy .env.example to .env and fill in the required values.');
    process.exit(1);
  }

  logger.info('[Startup] Environment validation passed.');
}

// ─────────────────────────────────────────────
// CLIENT CREATION
// ─────────────────────────────────────────────
function createClient() {
  return new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
    // Improve performance by only caching what's needed
    sweepers: {
      messages: {
        interval: 300, // Sweep every 5 minutes
        lifetime: 1800, // Remove messages older than 30 minutes
      },
      users: {
        interval: 3600, // Sweep every hour
        filter: () => (user) => !user.bot && user.id !== user.client.user?.id,
      },
    },
  });
}

// ─────────────────────────────────────────────
// MAIN BOOTSTRAP FUNCTION
// ─────────────────────────────────────────────
async function bootstrap() {
  logger.info('═'.repeat(50));
  logger.info(`  Starting ${config.bot.name} v${config.bot.version}...`);
  logger.info('═'.repeat(50));

  // Validate environment variables
  validateEnvironment();

  // Create Discord client
  const client = createClient();
  logger.info('[Startup] Discord client created.');

  // Load commands into client.commands
  await loadCommands(client);

  // Load and register event listeners
  await loadEvents(client);

  // Initialize the music player
  await initializePlayer(client);

  // Log in to Discord
  try {
    logger.info('[Startup] Logging in to Discord...');
    await client.login(process.env.TOKEN);
  } catch (error) {
    logger.error(`[Startup] Failed to log in: ${error.message}`);
    process.exit(1);
  }

  return client;
}

// ─────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────
let clientInstance = null;

async function shutdown(signal) {
  logger.info(`[Shutdown] Received ${signal}. Shutting down gracefully...`);

  if (clientInstance) {
    // Disconnect from all voice channels
    try {
      if (clientInstance.player) {
        for (const [guildId, queue] of clientInstance.player.nodes) {
          queue.delete();
        }
        logger.info('[Shutdown] Cleaned up all player queues.');
      }
    } catch (error) {
      logger.error(`[Shutdown] Error cleaning up players: ${error.message}`);
    }

    // Destroy the Discord client
    try {
      clientInstance.destroy();
      logger.info('[Shutdown] Discord client destroyed.');
    } catch (error) {
      logger.error(`[Shutdown] Error destroying client: ${error.message}`);
    }
  }

  logger.info('[Shutdown] Goodbye! 👋');
  process.exit(0);
}

// ─────────────────────────────────────────────
// UNHANDLED ERROR SAFETY NET
// ─────────────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`[Process] Unhandled Promise Rejection: ${reason}`);
  if (reason instanceof Error) {
    logger.error(reason.stack);
  }
});

process.on('uncaughtException', (error) => {
  logger.error(`[Process] Uncaught Exception: ${error.message}`);
  logger.error(error.stack);
  // Don't exit on uncaught exceptions — let the bot continue running
  // In extreme cases, Railway will restart the process automatically
});

// Handle graceful shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ─────────────────────────────────────────────
// START
// ─────────────────────────────────────────────
bootstrap()
  .then((client) => {
    clientInstance = client;
  })
  .catch((error) => {
    logger.error(`[Bootstrap] Fatal error: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  });
