/**
 * Vyntra Music Bot - /resume Command
 */

const { SlashCommandBuilder } = require('discord.js');
const { validateVoiceConditions, checkDJPermission } = require('../utils/permissions');
const { createErrorEmbed, createSuccessEmbed, createWarningEmbed } = require('../utils/embeds');
const config = require('../config/config');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused song.'),

  async execute(interaction) {
    await interaction.deferReply();

    if (!(await checkDJPermission(interaction))) return;

    const botVoiceChannel = interaction.guild.members.me?.voice?.channel;
    const validation = validateVoiceConditions(interaction.member, botVoiceChannel);
    if (!validation.valid) return interaction.editReply({ embeds: [validation.embed] });

    const queue = interaction.client.player.nodes.get(interaction.guild.id);

    if (!queue) {
      return interaction.editReply({ embeds: [createErrorEmbed(config.messages.noQueue)] });
    }

    if (!queue.node.isPaused()) {
      return interaction.editReply({
        embeds: [createWarningEmbed('The player is not paused.')],
      });
    }

    try {
      queue.node.resume();
      const currentTrack = queue.currentTrack;
      return interaction.editReply({
        embeds: [
          createSuccessEmbed(
            config.messages.resumed.replace('{title}', currentTrack?.title || 'Unknown')
          ),
        ],
      });
    } catch (error) {
      logger.error(`Resume command error: ${error.message}`);
      return interaction.editReply({ embeds: [createErrorEmbed(config.messages.playerError)] });
    }
  },
};
