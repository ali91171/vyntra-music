/**
 * Vyntra Music Bot - Player Event Handler
 * Registers all Discord Player events (track start, end, errors, etc.)
 */

const { createNowPlayingEmbed, createEmbed, createErrorEmbed } = require('../utils/embeds');
const { createMusicButtons, createDisabledMusicButtons } = require('../utils/musicButtons');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * Registers all player events on the Discord Player instance.
 * @param {Player} player - Discord Player instance.
 */
function registerPlayerEvents(player) {
  // ─────────────────────────────────────────────
  // TRACK START
  // ─────────────────────────────────────────────
  player.events.on('playerStart', async (queue, track) => {
    const channel = queue.metadata?.channel;
    if (!channel) return;

    try {
      const embed = createNowPlayingEmbed(track, queue);
      const buttons = createMusicButtons(false, queue.repeatMode);

      await channel.send({ embeds: [embed], components: [buttons] });
      logger.info(`[Player] Now playing: "${track.title}" in guild ${queue.guild.id}`);
    } catch (error) {
      logger.error(`[Player] playerStart send error: ${error.message}`);
    }
  });

  // ─────────────────────────────────────────────
  // TRACK END
  // ─────────────────────────────────────────────
  player.events.on('playerFinish', async (queue, track) => {
    logger.debug(`[Player] Track finished: "${track.title}" in guild ${queue.guild.id}`);
  });

  // ─────────────────────────────────────────────
  // QUEUE END
  // ─────────────────────────────────────────────
  player.events.on('emptyQueue', async (queue) => {
    const channel = queue.metadata?.channel;
    if (!channel) return;

    try {
      await channel.send({
        embeds: [
          createEmbed(
            '📭 The queue has ended. Use `/play` to add more songs!\n' +
            `The bot will disconnect in **${config.music.leaveOnEndDelay / 1000}s** if no songs are added.`,
            '🎵 Queue Ended'
          ),
        ],
      });
      logger.info(`[Player] Queue ended in guild ${queue.guild.id}`);
    } catch (error) {
      logger.error(`[Player] emptyQueue send error: ${error.message}`);
    }
  });

  // ─────────────────────────────────────────────
  // VOICE CHANNEL EMPTY
  // ─────────────────────────────────────────────
  player.events.on('emptyChannel', async (queue) => {
    const channel = queue.metadata?.channel;
    if (!channel) return;

    try {
      await channel.send({
        embeds: [createEmbed(config.messages.autoDisconnect, '👋 Disconnected')],
      });
      logger.info(`[Player] Auto-disconnected from empty VC in guild ${queue.guild.id}`);
    } catch (error) {
      logger.error(`[Player] emptyChannel send error: ${error.message}`);
    }
  });

  // ─────────────────────────────────────────────
  // PLAYER ERROR
  // ─────────────────────────────────────────────
  player.events.on('playerError', async (queue, error) => {
    const channel = queue.metadata?.channel;
    logger.error(`[Player] Player error in guild ${queue.guild?.id}: ${error.message}`);

    if (!channel) return;

    try {
      await channel.send({
        embeds: [
          createErrorEmbed(
            `${config.messages.playerError}\n\`\`\`${error.message}\`\`\``,
            '❌ Playback Error'
          ),
        ],
      });
    } catch (sendError) {
      logger.error(`[Player] playerError send error: ${sendError.message}`);
    }
  });

  // ─────────────────────────────────────────────
  // GENERAL ERROR
  // ─────────────────────────────────────────────
  player.events.on('error', async (queue, error) => {
    logger.error(`[Player] Queue error in guild ${queue.guild?.id}: ${error.message}`);
    const channel = queue.metadata?.channel;

    if (!channel) return;

    try {
      await channel.send({
        embeds: [createErrorEmbed(`An unexpected error occurred: \`${error.message}\``)],
      });
    } catch (sendError) {
      logger.error(`[Player] error event send error: ${sendError.message}`);
    }
  });

  // ─────────────────────────────────────────────
  // AUDIO TRACKS ADDED
  // ─────────────────────────────────────────────
  player.events.on('audioTracksAdd', (queue, tracks) => {
    logger.debug(`[Player] ${tracks.length} tracks added to queue in guild ${queue.guild.id}`);
  });

  // ─────────────────────────────────────────────
  // CONNECTION (debug)
  // ─────────────────────────────────────────────
  player.events.on('connection', (queue) => {
    logger.debug(`[Player] Voice connection established in guild ${queue.guild.id}`);
  });

  // ─────────────────────────────────────────────
  // DISCONNECT
  // ─────────────────────────────────────────────
  player.events.on('disconnect', async (queue) => {
    logger.info(`[Player] Disconnected from voice in guild ${queue.guild.id}`);
  });

  // ─────────────────────────────────────────────
  // DEBUG (only in development)
  // ─────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    player.events.on('debug', (queue, message) => {
      logger.debug(`[Player:Debug] ${message}`);
    });
  }

  logger.info('[PlayerEvents] All player events registered.');
}

module.exports = { registerPlayerEvents };
