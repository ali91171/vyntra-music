/**
 * Vyntra Music Bot - Player Initialization
 * Creates and configures the Discord Player instance.
 */

const { Player } = require('discord-player');
const { YoutubeiExtractor } = require('@discord-player/extractor');
const { registerPlayerEvents } = require('../handlers/playerEvents');
const logger = require('../utils/logger');

/**
 * Initializes the Discord Player and attaches it to the client.
 * @param {Client} client - Discord.js client instance.
 * @returns {Player}
 */
async function initializePlayer(client) {
  const player = new Player(client, {
    skipFFmpeg: false,
  });

  // Register the default extractors (YouTube, SoundCloud, Spotify, etc.)
  await player.extractors.loadDefault((ext) => {
    // Load all default extractors
    return true;
  });

  // Try to load YouTubei extractor for better YouTube support
  try {
    await player.extractors.register(YoutubeiExtractor, {});
    logger.info('[Player] YouTubei extractor registered.');
  } catch (error) {
    logger.warn(`[Player] Could not register YouTubei extractor: ${error.message}`);
  }

  // Register player events
  registerPlayerEvents(player);

  // Attach player to client for global access
  client.player = player;

  logger.info('[Player] Discord Player initialized successfully.');
  return player;
}

module.exports = { initializePlayer };
