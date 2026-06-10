/**
 * Vyntra Music Bot - /queue Command
 * Displays the current queue with pagination buttons.
 */

const { SlashCommandBuilder, ComponentType } = require('discord.js');
const { createErrorEmbed, createQueueEmbed } = require('../utils/embeds');
const { createQueueButtons } = require('../utils/musicButtons');
const config = require('../config/config');
const logger = require('../utils/logger');

const TRACKS_PER_PAGE = 10;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('View the current music queue.')
    .addIntegerOption((option) =>
      option
        .setName('page')
        .setDescription('Page number to view')
        .setMinValue(1)
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const queue = interaction.client.player.nodes.get(interaction.guild.id);

    if (!queue || (!queue.isPlaying() && queue.tracks.size === 0)) {
      return interaction.editReply({ embeds: [createErrorEmbed(config.messages.noQueue)] });
    }

    const tracks = queue.tracks.toArray();
    const totalPages = Math.max(1, Math.ceil(tracks.length / TRACKS_PER_PAGE));
    let currentPage = interaction.options.getInteger('page') || 1;
    currentPage = Math.min(Math.max(1, currentPage), totalPages);

    const embed = createQueueEmbed(queue, currentPage, TRACKS_PER_PAGE);
    const buttons = totalPages > 1 ? createQueueButtons(currentPage, totalPages) : null;

    const messageOptions = { embeds: [embed] };
    if (buttons) messageOptions.components = [buttons];

    const message = await interaction.editReply(messageOptions);

    if (totalPages <= 1) return;

    // Set up pagination collector
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120_000, // 2 minutes
      filter: (i) => i.user.id === interaction.user.id,
    });

    collector.on('collect', async (buttonInteraction) => {
      await buttonInteraction.deferUpdate();

      try {
        const refreshedQueue = interaction.client.player.nodes.get(interaction.guild.id);
        if (!refreshedQueue) {
          collector.stop();
          return;
        }

        if (buttonInteraction.customId.startsWith('queue_prev_')) {
          currentPage = Math.max(1, currentPage - 1);
        } else if (buttonInteraction.customId.startsWith('queue_next_')) {
          const refreshedTracks = refreshedQueue.tracks.toArray();
          const refreshedTotalPages = Math.max(
            1,
            Math.ceil(refreshedTracks.length / TRACKS_PER_PAGE)
          );
          currentPage = Math.min(totalPages, currentPage + 1, refreshedTotalPages);
        }

        const updatedEmbed = createQueueEmbed(refreshedQueue, currentPage, TRACKS_PER_PAGE);
        const refreshedTracks = refreshedQueue.tracks.toArray();
        const updatedTotalPages = Math.max(
          1,
          Math.ceil(refreshedTracks.length / TRACKS_PER_PAGE)
        );
        const updatedButtons = createQueueButtons(currentPage, updatedTotalPages);

        await buttonInteraction.editReply({
          embeds: [updatedEmbed],
          components: [updatedButtons],
        });
      } catch (error) {
        logger.error(`Queue pagination error: ${error.message}`);
      }
    });

    collector.on('end', async () => {
      try {
        await message.edit({ components: [] });
      } catch {
        // Message may have been deleted
      }
    });
  },
};
