/**
 * Vyntra Music Bot - /autoplay Command
 */

const { SlashCommandBuilder } = require('discord.js');
const { QueueRepeatMode } = require('discord-player');
const { validateVoiceConditions, checkDJPermission } = require('../utils/permissions');
const { createErrorEmbed, createSuccessEmbed } = require('../utils/embeds');
const config = require('../config/config');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoplay')
    .setDescription('Toggle autoplay mode (automatically adds related songs when queue ends).'),

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

    try {
      const isAutoplay = queue.repeatMode === QueueRepeatMode.AUTOPLAY;

      if (isAutoplay) {
        queue.setRepeatMode(QueueRepeatMode.OFF);
        return interaction.editReply({
          embeds: [createSuccessEmbed('✨ Autoplay **disabled**.')],
        });
      } else {
        queue.setRepeatMode(QueueRepeatMode.AUTOPLAY);
        return interaction.editReply({
          embeds: [createSuccessEmbed('✨ Autoplay **enabled**. Related songs will be added automatically.')],
        });
      }
    } catch (error) {
      logger.error(`Autoplay command error: ${error.message}`);
      return interaction.editReply({ embeds: [createErrorEmbed(config.messages.playerError)] });
    }
  },
};
