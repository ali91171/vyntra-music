/**
 * Vyntra Music Bot - /skip Command
 */

const { SlashCommandBuilder } = require('discord.js');
const { validateVoiceConditions, checkDJPermission } = require('../utils/permissions');
const { createErrorEmbed, createSuccessEmbed } = require('../utils/embeds');
const config = require('../config/config');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song.')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Number of songs to skip (default: 1)')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(false)
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

    const amount = interaction.options.getInteger('amount') || 1;
    const currentTrack = queue.currentTrack;

    try {
      if (amount === 1) {
        queue.node.skip();
        return interaction.editReply({
          embeds: [
            createSuccessEmbed(
              config.messages.skipped.replace('{title}', currentTrack?.title || 'Unknown')
            ),
          ],
        });
      } else {
        // Skip multiple tracks
        const tracksToRemove = Math.min(amount - 1, queue.tracks.size);
        for (let i = 0; i < tracksToRemove; i++) {
          queue.node.remove(0);
        }
        queue.node.skip();
        return interaction.editReply({
          embeds: [createSuccessEmbed(`⏭️ Skipped **${amount}** tracks.`)],
        });
      }
    } catch (error) {
      logger.error(`Skip command error: ${error.message}`);
      return interaction.editReply({ embeds: [createErrorEmbed(config.messages.playerError)] });
    }
  },
};
