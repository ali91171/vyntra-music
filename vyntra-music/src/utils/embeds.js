/**
 * Vyntra Music Bot - Embed Utility
 * Factory functions for all embed types to ensure consistent design.
 */

const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');

/**
 * Creates a standard informational/success embed.
 * @param {string} description - The embed description text.
 * @param {string} [title] - Optional title.
 * @returns {EmbedBuilder}
 */
function createEmbed(description, title = null) {
  const embed = new EmbedBuilder()
    .setColor(config.bot.embedColor)
    .setFooter({
      text: config.bot.footerText,
      iconURL: config.bot.footerIcon || undefined,
    })
    .setTimestamp();

  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);

  return embed;
}

/**
 * Creates a success embed (green).
 * @param {string} description
 * @param {string} [title]
 * @returns {EmbedBuilder}
 */
function createSuccessEmbed(description, title = null) {
  const embed = new EmbedBuilder()
    .setColor(config.bot.successColor)
    .setFooter({
      text: config.bot.footerText,
      iconURL: config.bot.footerIcon || undefined,
    })
    .setTimestamp();

  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);

  return embed;
}

/**
 * Creates an error embed (red).
 * @param {string} description
 * @param {string} [title]
 * @returns {EmbedBuilder}
 */
function createErrorEmbed(description, title = '❌ Error') {
  const embed = new EmbedBuilder()
    .setColor(config.bot.errorColor)
    .setTitle(title)
    .setFooter({
      text: config.bot.footerText,
      iconURL: config.bot.footerIcon || undefined,
    })
    .setTimestamp();

  if (description) embed.setDescription(description);

  return embed;
}

/**
 * Creates a warning embed (yellow).
 * @param {string} description
 * @param {string} [title]
 * @returns {EmbedBuilder}
 */
function createWarningEmbed(description, title = '⚠️ Warning') {
  const embed = new EmbedBuilder()
    .setColor(config.bot.warningColor)
    .setTitle(title)
    .setFooter({
      text: config.bot.footerText,
      iconURL: config.bot.footerIcon || undefined,
    })
    .setTimestamp();

  if (description) embed.setDescription(description);

  return embed;
}

/**
 * Creates a "Now Playing" embed with full track info.
 * @param {object} track - Discord Player track object.
 * @param {object} queue - Discord Player queue object.
 * @returns {EmbedBuilder}
 */
function createNowPlayingEmbed(track, queue) {
  const progressBar = generateProgressBar(
    queue.node.getTimestamp()?.current?.value || 0,
    track.durationMS,
    config.music.progressBarLength
  );

  const timestamp = queue.node.getTimestamp();
  const currentTime = timestamp?.current?.label || '0:00';
  const totalTime = track.duration || '0:00';

  const embed = new EmbedBuilder()
    .setColor(config.bot.embedColor)
    .setTitle('🎵 Now Playing')
    .setDescription(
      `**[${track.title}](${track.url})**\n` +
      `by **${track.author}**\n\n` +
      `${progressBar}\n` +
      `\`${currentTime}\` / \`${totalTime}\``
    )
    .addFields(
      {
        name: '🔊 Volume',
        value: `${queue.node.volume}%`,
        inline: true,
      },
      {
        name: '🔁 Loop',
        value: getLoopModeLabel(queue.repeatMode),
        inline: true,
      },
      {
        name: '📋 Queue',
        value: `${queue.tracks.size} track(s)`,
        inline: true,
      },
      {
        name: '🎧 Source',
        value: capitalize(track.source || 'unknown'),
        inline: true,
      },
      {
        name: '👤 Requested by',
        value: track.requestedBy ? `<@${track.requestedBy.id}>` : 'Unknown',
        inline: true,
      },
      {
        name: '⏱️ Duration',
        value: totalTime,
        inline: true,
      }
    )
    .setFooter({
      text: config.bot.footerText,
      iconURL: config.bot.footerIcon || undefined,
    })
    .setTimestamp();

  if (track.thumbnail) {
    embed.setThumbnail(track.thumbnail);
  }

  return embed;
}

/**
 * Creates a "Track Added" embed.
 * @param {object} track - Discord Player track object.
 * @param {number} position - Position in queue.
 * @returns {EmbedBuilder}
 */
function createTrackAddedEmbed(track, position) {
  const embed = new EmbedBuilder()
    .setColor(config.bot.successColor)
    .setTitle('✅ Added to Queue')
    .setDescription(`**[${track.title}](${track.url})**\nby **${track.author}**`)
    .addFields(
      {
        name: '⏱️ Duration',
        value: track.duration || 'Unknown',
        inline: true,
      },
      {
        name: '📍 Position',
        value: position === 0 ? 'Now Playing' : `#${position}`,
        inline: true,
      },
      {
        name: '🎧 Source',
        value: capitalize(track.source || 'unknown'),
        inline: true,
      }
    )
    .setFooter({
      text: config.bot.footerText,
      iconURL: config.bot.footerIcon || undefined,
    })
    .setTimestamp();

  if (track.thumbnail) {
    embed.setThumbnail(track.thumbnail);
  }

  return embed;
}

/**
 * Creates a queue embed for a specific page.
 * @param {object} queue - Discord Player queue object.
 * @param {number} page - Current page number (1-indexed).
 * @param {number} tracksPerPage - Number of tracks per page.
 * @returns {EmbedBuilder}
 */
function createQueueEmbed(queue, page = 1, tracksPerPage = 10) {
  const tracks = queue.tracks.toArray();
  const totalPages = Math.max(1, Math.ceil(tracks.length / tracksPerPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const start = (currentPage - 1) * tracksPerPage;
  const end = start + tracksPerPage;
  const pageTracks = tracks.slice(start, end);

  const currentTrack = queue.currentTrack;

  let description = '';

  if (currentTrack) {
    description += `**Now Playing:**\n🎵 [${currentTrack.title}](${currentTrack.url}) — \`${currentTrack.duration}\`\nRequested by ${currentTrack.requestedBy ? `<@${currentTrack.requestedBy.id}>` : 'Unknown'}\n\n`;
  }

  if (pageTracks.length > 0) {
    description += `**Up Next:**\n`;
    pageTracks.forEach((track, index) => {
      const globalIndex = start + index + 1;
      description += `\`${globalIndex}.\` [${track.title}](${track.url}) — \`${track.duration}\`\n`;
    });
  } else if (!currentTrack) {
    description = '📭 The queue is empty.';
  }

  const totalDuration = calculateTotalDuration(tracks);

  const embed = new EmbedBuilder()
    .setColor(config.bot.embedColor)
    .setTitle('📋 Music Queue')
    .setDescription(description)
    .addFields(
      {
        name: '📊 Tracks in Queue',
        value: `${tracks.length}`,
        inline: true,
      },
      {
        name: '⏱️ Total Duration',
        value: totalDuration,
        inline: true,
      },
      {
        name: '🔁 Loop Mode',
        value: getLoopModeLabel(queue.repeatMode),
        inline: true,
      }
    )
    .setFooter({
      text: `Page ${currentPage}/${totalPages} • ${config.bot.footerText}`,
      iconURL: config.bot.footerIcon || undefined,
    })
    .setTimestamp();

  return embed;
}

// ─────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Generates an ASCII progress bar string.
 * @param {number} current - Current position in ms.
 * @param {number} total - Total duration in ms.
 * @param {number} length - Bar character length.
 * @returns {string}
 */
function generateProgressBar(current, total, length = 20) {
  if (!total || total <= 0) return '▬'.repeat(length);

  const progress = Math.min(current / total, 1);
  const filled = Math.round(progress * length);
  const empty = length - filled;

  const bar = '▬'.repeat(filled > 0 ? filled - 1 : 0) + '🔘' + '▬'.repeat(empty);
  return bar;
}

/**
 * Returns a human-readable label for loop modes.
 * @param {number} mode
 * @returns {string}
 */
function getLoopModeLabel(mode) {
  const modes = {
    0: '🔇 Off',
    1: '🔂 Track',
    2: '🔁 Queue',
    3: '✨ Autoplay',
  };
  return modes[mode] || '🔇 Off';
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
  if (!str) return 'Unknown';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Calculates total duration of a track array (formatted).
 * @param {Array} tracks
 * @returns {string}
 */
function calculateTotalDuration(tracks) {
  if (!tracks || tracks.length === 0) return '0:00';

  let totalMs = 0;
  for (const track of tracks) {
    if (track.durationMS) {
      totalMs += track.durationMS;
    }
  }

  const totalSeconds = Math.floor(totalMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

module.exports = {
  createEmbed,
  createSuccessEmbed,
  createErrorEmbed,
  createWarningEmbed,
  createNowPlayingEmbed,
  createTrackAddedEmbed,
  createQueueEmbed,
  generateProgressBar,
  getLoopModeLabel,
  capitalize,
  calculateTotalDuration,
};
