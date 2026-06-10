/**
 * Vyntra Music Bot - Voice State Update Event
 * Handles bot reconnection protection and empty channel detection.
 */

const logger = require('../utils/logger');

module.exports = {
  name: 'voiceStateUpdate',
  once: false,

  async execute(oldState, newState, client) {
    // Ignore updates that aren't about the bot itself
    if (newState.member?.id !== client.user.id) return;

    const queue = client.player?.nodes.get(oldState.guild.id);
    if (!queue) return;

    // Bot was forcefully disconnected from voice channel
    if (oldState.channelId && !newState.channelId) {
      logger.info(
        `[VoiceState] Bot was disconnected from voice in guild ${oldState.guild.id}. Cleaning up queue.`
      );

      try {
        // Notify the text channel if possible
        const channel = queue.metadata?.channel;
        if (channel) {
          const { createEmbed } = require('../utils/embeds');
          await channel.send({
            embeds: [createEmbed('👋 I was disconnected from the voice channel. Queue has been cleared.', '🔌 Disconnected')],
          }).catch(() => {});
        }

        // Delete the queue to clean up resources
        if (queue.isPlaying()) {
          queue.delete();
        }
      } catch (error) {
        logger.error(`[VoiceState] Error during disconnect cleanup: ${error.message}`);
      }
      return;
    }

    // Bot was moved to a different channel
    if (
      oldState.channelId &&
      newState.channelId &&
      oldState.channelId !== newState.channelId
    ) {
      logger.info(
        `[VoiceState] Bot was moved from ${oldState.channelId} to ${newState.channelId} in guild ${oldState.guild.id}`
      );
    }
  },
};
