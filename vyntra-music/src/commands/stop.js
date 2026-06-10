/**
 * Vyntra Music Bot - /stop Command
 */

const { SlashCommandBuilder } = require('discord.js');
const { validateVoiceConditions, checkDJPermission } = require('../utils/permissions');
const { createErrorEmbed, createSuccessEmbed } = require('../utils/embeds');
const config = require('../config/config');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the music and clear the queue.'),

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
      queue.delete();
      return interaction.editReply({
        embeds: [createSuccessEmbed(config.messages.stopped)],
      });
    } catch (error) {
      logger.error(`Stop command error: ${error.message}`);
      return interaction.editReply({ embeds: [createErrorEmbed(config.messages.playerError)] });
    }
  },
};
