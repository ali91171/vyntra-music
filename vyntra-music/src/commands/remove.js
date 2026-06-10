/**
 * Vyntra Music Bot - /remove Command
 * Removes a specific track from the queue by position.
 */

const { SlashCommandBuilder } = require('discord.js');
const { validateVoiceConditions, checkDJPermission } = require('../utils/permissions');
const { createErrorEmbed, createSuccessEmbed } = require('../utils/embeds');
const config = require('../config/config');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a song from the queue by its position.')
    .addIntegerOption((option) =>
      option
        .setName('position')
        .setDescription('Position of the song to remove (from /queue)')
        .setMinValue(1)
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    if (!(await checkDJPermission(interaction))) return;

    const botVoiceChannel = interaction.guild.members.me?.voice?.channel;
    const validation = validateVoiceConditions(interaction.member, botVoiceChannel);
    if (!validation.valid) return interaction.editReply({ embeds: [validation.embed] });

    const queue = interaction.client.player.nodes.get(interaction.guild.id);

    if (!queue || !queue.isPlaying()) {
      return interaction.editReply({ embeds: [createErrorEmbed(config.messages.noQueue)] });
    }

    if (queue.tracks.size === 0) {
      return interaction.editReply({ embeds: [createErrorEmbed(config.messages.emptyQueue)] });
    }

    const position = interaction.options.getInteger('position', true);

    if (position > queue.tracks.size) {
      return interaction.editReply({
        embeds: [
          createErrorEmbed(
            `${config.messages.invalidPosition}\nThere are only **${queue.tracks.size}** track(s) in the queue.`
          ),
        ],
      });
    }

    try {
      // Discord Player uses 0-indexed removal
      const track = queue.tracks.at(position - 1);
      queue.node.remove(position - 1);

      return interaction.editReply({
        embeds: [
          createSuccessEmbed(
            config.messages.removed.replace('{title}', track?.title || 'Unknown')
          ),
        ],
      });
    } catch (error) {
      logger.error(`Remove command error: ${error.message}`);
      return interaction.editReply({ embeds: [createErrorEmbed(config.messages.playerError)] });
    }
  },
};
