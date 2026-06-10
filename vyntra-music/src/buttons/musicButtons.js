/**
 * Vyntra Music Bot - Music Button Interaction Handler
 * Handles all button interactions for the music player.
 */

const { QueueRepeatMode } = require('discord-player');
const { createErrorEmbed, createSuccessEmbed, createNowPlayingEmbed } = require('../utils/embeds');
const { createMusicButtons } = require('../utils/musicButtons');
const { hasDJPermission } = require('../utils/permissions');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * Main button interaction router.
 * @param {ButtonInteraction} interaction
 */
async function handleMusicButton(interaction) {
  const { customId, guild, member } = interaction;

  // Ignore disabled buttons
  if (customId.endsWith('_disabled')) {
    return interaction.reply({ content: '⏸️ No active player.', ephemeral: true });
  }

  const queue = interaction.client.player.nodes.get(guild.id);

  // Queue pagination buttons don't require active player
  if (customId.startsWith('queue_')) {
    return handleQueuePagination(interaction, queue);
  }

  if (!queue || !queue.isPlaying()) {
    return interaction.reply({
      embeds: [createErrorEmbed('❌ No active player. Use `/play` to start music.')],
      ephemeral: true,
    });
  }

  // Check DJ permission for music control buttons
  if (!hasDJPermission(member)) {
    return interaction.reply({
      embeds: [createErrorEmbed(config.messages.noDJRole)],
      ephemeral: true,
    });
  }

  // Route to the appropriate handler
  switch (customId) {
    case 'music_pause':
      return handlePause(interaction, queue);
    case 'music_resume':
      return handleResume(interaction, queue);
    case 'music_skip':
      return handleSkip(interaction, queue);
    case 'music_stop':
      return handleStop(interaction, queue);
    case 'music_loop':
      return handleLoop(interaction, queue);
    case 'music_shuffle':
      return handleShuffle(interaction, queue);
    default:
      return interaction.reply({
        content: '❓ Unknown button.',
        ephemeral: true,
      });
  }
}

// ─────────────────────────────────────────────
// BUTTON HANDLERS
// ─────────────────────────────────────────────

async function handlePause(interaction, queue) {
  try {
    if (queue.node.isPaused()) {
      return interaction.reply({
        embeds: [createErrorEmbed('The player is already paused.')],
        ephemeral: true,
      });
    }
    queue.node.pause();
    await interaction.reply({
      embeds: [createSuccessEmbed(`⏸️ Paused **${queue.currentTrack?.title || 'Unknown'}**.`)],
      ephemeral: true,
    });
    // Update the button row on the original message
    await updatePlayerButtons(interaction, queue, true);
  } catch (error) {
    logger.error(`Button pause error: ${error.message}`);
    await interaction.reply({ embeds: [createErrorEmbed(config.messages.playerError)], ephemeral: true });
  }
}

async function handleResume(interaction, queue) {
  try {
    if (!queue.node.isPaused()) {
      return interaction.reply({
        embeds: [createErrorEmbed('The player is not paused.')],
        ephemeral: true,
      });
    }
    queue.node.resume();
    await interaction.reply({
      embeds: [createSuccessEmbed(`▶️ Resumed **${queue.currentTrack?.title || 'Unknown'}**.`)],
      ephemeral: true,
    });
    await updatePlayerButtons(interaction, queue, false);
  } catch (error) {
    logger.error(`Button resume error: ${error.message}`);
    await interaction.reply({ embeds: [createErrorEmbed(config.messages.playerError)], ephemeral: true });
  }
}

async function handleSkip(interaction, queue) {
  try {
    const skippedTitle = queue.currentTrack?.title || 'Unknown';
    queue.node.skip();
    await interaction.reply({
      embeds: [createSuccessEmbed(`⏭️ Skipped **${skippedTitle}**.`)],
      ephemeral: true,
    });
  } catch (error) {
    logger.error(`Button skip error: ${error.message}`);
    await interaction.reply({ embeds: [createErrorEmbed(config.messages.playerError)], ephemeral: true });
  }
}

async function handleStop(interaction, queue) {
  try {
    queue.delete();
    await interaction.reply({
      embeds: [createSuccessEmbed(config.messages.stopped)],
      ephemeral: true,
    });
    // Disable the buttons on the original message
    try {
      await interaction.message.edit({ components: [] });
    } catch { /* Message may already be gone */ }
  } catch (error) {
    logger.error(`Button stop error: ${error.message}`);
    await interaction.reply({ embeds: [createErrorEmbed(config.messages.playerError)], ephemeral: true });
  }
}

async function handleLoop(interaction, queue) {
  try {
    // Cycle through loop modes: OFF -> TRACK -> QUEUE -> AUTOPLAY -> OFF
    const nextMode = (queue.repeatMode + 1) % 4;
    queue.setRepeatMode(nextMode);

    const modeLabels = {
      0: '🔇 Loop **disabled**.',
      1: '🔂 Now looping the current **track**.',
      2: '🔁 Now looping the entire **queue**.',
      3: '✨ **Autoplay** enabled.',
    };

    await interaction.reply({
      embeds: [createSuccessEmbed(modeLabels[nextMode])],
      ephemeral: true,
    });
    await updatePlayerButtons(interaction, queue, queue.node.isPaused());
  } catch (error) {
    logger.error(`Button loop error: ${error.message}`);
    await interaction.reply({ embeds: [createErrorEmbed(config.messages.playerError)], ephemeral: true });
  }
}

async function handleShuffle(interaction, queue) {
  try {
    if (queue.tracks.size < 2) {
      return interaction.reply({
        embeds: [createErrorEmbed('Need at least 2 queued tracks to shuffle.')],
        ephemeral: true,
      });
    }
    queue.tracks.shuffle();
    await interaction.reply({
      embeds: [createSuccessEmbed(`🔀 Shuffled **${queue.tracks.size}** tracks.`)],
      ephemeral: true,
    });
  } catch (error) {
    logger.error(`Button shuffle error: ${error.message}`);
    await interaction.reply({ embeds: [createErrorEmbed(config.messages.playerError)], ephemeral: true });
  }
}

async function handleQueuePagination(interaction, queue) {
  // Queue pagination is handled in the queue command's own collector
  // This is a fallback for expired collectors
  await interaction.reply({
    content: '⏱️ This queue view has expired. Use `/queue` to see a fresh view.',
    ephemeral: true,
  });
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Updates the button row on the original "Now Playing" / "Track Added" message.
 */
async function updatePlayerButtons(interaction, queue, isPaused) {
  try {
    const updatedButtons = createMusicButtons(isPaused, queue.repeatMode);
    await interaction.message.edit({ components: [updatedButtons] });
  } catch {
    // Message may have been deleted or is no longer editable
  }
}

module.exports = { handleMusicButton };
