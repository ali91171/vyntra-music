/**
 * Vyntra Music Bot - /volume Command
 */

const { SlashCommandBuilder } = require('discord.js');
const { validateVoiceConditions, checkDJPermission } = require('../utils/permissions');
const { createErrorEmbed, createSuccessEmbed, createEmbed } = require('../utils/embeds');
const config = require('../config/config');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set or check the playback volume.')
    .addIntegerOption((option) =>
      option
        .setName('level')
        .setDescription(`Volume level (0–${config.music.maxVolume})`)
        .setMinValue(0)
        .setMaxValue(config.music.maxVolume)
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const queue = interaction.client.player.nodes.get(interaction.guild.id);

    if (!queue || !queue.isPlaying()) {
      return interaction.editReply({ embeds: [createErrorEmbed(config.messages.noQueue)] });
    }

    const level = interaction.options.getInteger('level');

    // If no level provided, show current volume
    if (level === null) {
      const currentVolume = queue.node.volume;
      const bar = generateVolumeBar(currentVolume);
      return interaction.editReply({
        embeds: [
          createEmbed(
            `🔊 Current volume: **${currentVolume}%**\n${bar}`,
            '🔊 Volume'
          ),
        ],
      });
    }

    // Validate DJ permission for changing volume
    if (!(await checkDJPermission(interaction))) return;

    const botVoiceChannel = interaction.guild.members.me?.voice?.channel;
    const validation = validateVoiceConditions(interaction.member, botVoiceChannel);
    if (!validation.valid) return interaction.editReply({ embeds: [validation.embed] });

    try {
      queue.node.setVolume(level);
      const bar = generateVolumeBar(level);
      return interaction.editReply({
        embeds: [
          createSuccessEmbed(
            `${config.messages.volumeSet.replace('{volume}', level)}\n${bar}`
          ),
        ],
      });
    } catch (error) {
      logger.error(`Volume command error: ${error.message}`);
      return interaction.editReply({ embeds: [createErrorEmbed(config.messages.playerError)] });
    }
  },
};

function generateVolumeBar(volume) {
  const filled = Math.round(volume / 5);
  const empty = 20 - filled;
  const emoji = volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊';
  return `${emoji} ${'█'.repeat(filled)}${'░'.repeat(empty)} ${volume}%`;
}
