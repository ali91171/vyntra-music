/**
 * Vyntra Music Bot - /nowplaying Command
 */

const { SlashCommandBuilder } = require('discord.js');
const { createErrorEmbed, createNowPlayingEmbed } = require('../utils/embeds');
const { createMusicButtons } = require('../utils/musicButtons');
const config = require('../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show the currently playing song with progress.'),

  async execute(interaction) {
    await interaction.deferReply();

    const queue = interaction.client.player.nodes.get(interaction.guild.id);

    if (!queue || !queue.isPlaying()) {
      return interaction.editReply({ embeds: [createErrorEmbed(config.messages.noQueue)] });
    }

    const currentTrack = queue.currentTrack;
    if (!currentTrack) {
      return interaction.editReply({
        embeds: [createErrorEmbed(config.messages.noCurrentTrack)],
      });
    }

    const embed = createNowPlayingEmbed(currentTrack, queue);
    const buttons = createMusicButtons(queue.node.isPaused(), queue.repeatMode);

    return interaction.editReply({ embeds: [embed], components: [buttons] });
  },
};
