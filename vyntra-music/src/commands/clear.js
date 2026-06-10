/**
 * Vyntra Music Bot - /clear Command
 */

const { SlashCommandBuilder } = require('discord.js');
const { validateVoiceConditions, checkDJPermission } = require('../utils/permissions');
const { createErrorEmbed, createSuccessEmbed } = require('../utils/embeds');
const config = require('../config/config');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear all songs from the queue (keeps the current song playing).'),

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

    try {
      const count = queue.tracks.size;
      queue.tracks.clear();

      return interaction.editReply({
        embeds: [
          createSuccessEmbed(
            `${config.messages.cleared}\n🗑️ Removed **${count}** track(s) from the queue.`
          ),
        ],
      });
    } catch (error) {
      logger.error(`Clear command error: ${error.message}`);
      return interaction.editReply({ embeds: [createErrorEmbed(config.messages.playerError)] });
    }
  },
};
