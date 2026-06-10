/**
 * Vyntra Music Bot - /loop Command
 */

const { SlashCommandBuilder } = require('discord.js');
const { QueueRepeatMode } = require('discord-player');
const { validateVoiceConditions, checkDJPermission } = require('../utils/permissions');
const { createErrorEmbed, createSuccessEmbed } = require('../utils/embeds');
const config = require('../config/config');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Set the loop mode for the queue.')
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('Loop mode to set')
        .setRequired(true)
        .addChoices(
          { name: '🔇 Off', value: 'off' },
          { name: '🔂 Track', value: 'track' },
          { name: '🔁 Queue', value: 'queue' },
          { name: '✨ Autoplay', value: 'autoplay' }
        )
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

    const modeString = interaction.options.getString('mode', true);

    const modeMap = {
      off: QueueRepeatMode.OFF,
      track: QueueRepeatMode.TRACK,
      queue: QueueRepeatMode.QUEUE,
      autoplay: QueueRepeatMode.AUTOPLAY,
    };

    const messageMap = {
      off: config.messages.loopOff,
      track: config.messages.loopTrack,
      queue: config.messages.loopQueue,
      autoplay: config.messages.autoplay,
    };

    try {
      queue.setRepeatMode(modeMap[modeString]);
      return interaction.editReply({
        embeds: [createSuccessEmbed(messageMap[modeString])],
      });
    } catch (error) {
      logger.error(`Loop command error: ${error.message}`);
      return interaction.editReply({ embeds: [createErrorEmbed(config.messages.playerError)] });
    }
  },
};
