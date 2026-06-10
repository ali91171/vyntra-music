/**
 * Vyntra Music Bot - /shuffle Command
 */

const { SlashCommandBuilder } = require('discord.js');
const { validateVoiceConditions, checkDJPermission } = require('../utils/permissions');
const { createErrorEmbed, createSuccessEmbed } = require('../utils/embeds');
const config = require('../config/config');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the current queue.'),

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

    if (queue.tracks.size < 2) {
      return interaction.editReply({
        embeds: [createErrorEmbed('⚠️ There need to be at least 2 tracks in the queue to shuffle.')],
      });
    }

    try {
      queue.tracks.shuffle();
      return interaction.editReply({
        embeds: [
          createSuccessEmbed(
            `${config.messages.shuffled}\n📋 **${queue.tracks.size}** tracks shuffled.`
          ),
        ],
      });
    } catch (error) {
      logger.error(`Shuffle command error: ${error.message}`);
      return interaction.editReply({ embeds: [createErrorEmbed(config.messages.playerError)] });
    }
  },
};
