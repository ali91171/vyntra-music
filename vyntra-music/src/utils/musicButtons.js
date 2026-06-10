/**
 * Vyntra Music Bot - Music Buttons Utility
 * Builds interactive button rows for the music player.
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Creates the primary music control button row.
 * @param {boolean} isPaused - Whether the player is currently paused.
 * @param {number} loopMode - Current loop mode (0=off, 1=track, 2=queue, 3=autoplay).
 * @returns {ActionRowBuilder}
 */
function createMusicButtons(isPaused = false, loopMode = 0) {
  const pauseResumeButton = new ButtonBuilder()
    .setCustomId(isPaused ? 'music_resume' : 'music_pause')
    .setLabel(isPaused ? 'Resume' : 'Pause')
    .setEmoji(isPaused ? '▶️' : '⏸️')
    .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Primary);

  const skipButton = new ButtonBuilder()
    .setCustomId('music_skip')
    .setLabel('Skip')
    .setEmoji('⏭️')
    .setStyle(ButtonStyle.Secondary);

  const stopButton = new ButtonBuilder()
    .setCustomId('music_stop')
    .setLabel('Stop')
    .setEmoji('⏹️')
    .setStyle(ButtonStyle.Danger);

  const loopButton = new ButtonBuilder()
    .setCustomId('music_loop')
    .setLabel(getLoopButtonLabel(loopMode))
    .setEmoji(getLoopButtonEmoji(loopMode))
    .setStyle(loopMode > 0 ? ButtonStyle.Success : ButtonStyle.Secondary);

  const shuffleButton = new ButtonBuilder()
    .setCustomId('music_shuffle')
    .setLabel('Shuffle')
    .setEmoji('🔀')
    .setStyle(ButtonStyle.Secondary);

  return new ActionRowBuilder().addComponents(
    pauseResumeButton,
    skipButton,
    stopButton,
    loopButton,
    shuffleButton
  );
}

/**
 * Creates a disabled version of the music buttons (used when track ends).
 * @returns {ActionRowBuilder}
 */
function createDisabledMusicButtons() {
  const buttons = [
    new ButtonBuilder()
      .setCustomId('music_pause_disabled')
      .setLabel('Pause')
      .setEmoji('⏸️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId('music_skip_disabled')
      .setLabel('Skip')
      .setEmoji('⏭️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId('music_stop_disabled')
      .setLabel('Stop')
      .setEmoji('⏹️')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId('music_loop_disabled')
      .setLabel('Loop Off')
      .setEmoji('🔇')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId('music_shuffle_disabled')
      .setLabel('Shuffle')
      .setEmoji('🔀')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
  ];

  return new ActionRowBuilder().addComponents(...buttons);
}

/**
 * Creates queue navigation buttons.
 * @param {number} currentPage
 * @param {number} totalPages
 * @returns {ActionRowBuilder}
 */
function createQueueButtons(currentPage, totalPages) {
  const prevButton = new ButtonBuilder()
    .setCustomId(`queue_prev_${currentPage}`)
    .setLabel('Previous')
    .setEmoji('◀️')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(currentPage <= 1);

  const pageButton = new ButtonBuilder()
    .setCustomId('queue_page_display')
    .setLabel(`Page ${currentPage}/${totalPages}`)
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(true);

  const nextButton = new ButtonBuilder()
    .setCustomId(`queue_next_${currentPage}`)
    .setLabel('Next')
    .setEmoji('▶️')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(currentPage >= totalPages);

  return new ActionRowBuilder().addComponents(prevButton, pageButton, nextButton);
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getLoopButtonLabel(loopMode) {
  const labels = { 0: 'Loop Off', 1: 'Loop Track', 2: 'Loop Queue', 3: 'Autoplay' };
  return labels[loopMode] || 'Loop Off';
}

function getLoopButtonEmoji(loopMode) {
  const emojis = { 0: '🔇', 1: '🔂', 2: '🔁', 3: '✨' };
  return emojis[loopMode] || '🔇';
}

module.exports = {
  createMusicButtons,
  createDisabledMusicButtons,
  createQueueButtons,
};
