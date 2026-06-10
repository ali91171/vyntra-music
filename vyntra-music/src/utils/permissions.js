/**
 * Vyntra Music Bot - Permissions Utility
 * Handles DJ role checks, admin bypasses, and voice channel validation.
 */

const { PermissionFlagsBits } = require('discord.js');
const config = require('../config/config');
const { createErrorEmbed } = require('./embeds');

/**
 * Checks if a member has DJ permissions.
 * Admin roles and guild administrators always bypass the DJ check.
 *
 * @param {GuildMember} member - The Discord guild member.
 * @returns {boolean}
 */
function hasDJPermission(member) {
  // Guild owner always has permission
  if (member.guild.ownerId === member.id) return true;

  // Administrator permission bypasses DJ requirement
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;

  // Check admin roles
  if (config.permissions.adminRoles.length > 0) {
    const hasAdminRole = config.permissions.adminRoles.some(
      (roleId) => member.roles.cache.has(roleId)
    );
    if (hasAdminRole) return true;
  }

  // If no DJ roles are configured, everyone has access
  if (config.permissions.djRoles.length === 0) return true;

  // Check DJ roles
  return config.permissions.djRoles.some((roleId) => member.roles.cache.has(roleId));
}

/**
 * Checks if a command requires DJ permission.
 * @param {string} commandName
 * @returns {boolean}
 */
function requiresDJ(commandName) {
  return config.permissions.djCommands.includes(commandName);
}

/**
 * Validates voice channel conditions for music commands.
 * Returns an error message string if validation fails, or null if all OK.
 *
 * @param {GuildMember} member - The command executor.
 * @param {VoiceBasedChannel|null} botChannel - The bot's current voice channel (if any).
 * @returns {{ valid: boolean, embed: EmbedBuilder|null }}
 */
function validateVoiceConditions(member, botChannel = null) {
  const voiceChannel = member.voice.channel;

  // User must be in a voice channel
  if (!voiceChannel) {
    return {
      valid: false,
      embed: createErrorEmbed(config.messages.noVoiceChannel),
    };
  }

  // Check bot permissions in the voice channel
  const permissions = voiceChannel.permissionsFor(member.guild.members.me);
  if (!permissions.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak)) {
    return {
      valid: false,
      embed: createErrorEmbed(config.messages.botNoPermission),
    };
  }

  // If bot is in a channel and the setting requires same channel
  if (
    config.permissions.requireSameVoiceChannel &&
    botChannel &&
    voiceChannel.id !== botChannel.id
  ) {
    return {
      valid: false,
      embed: createErrorEmbed(config.messages.notSameChannel),
    };
  }

  return { valid: true, embed: null };
}

/**
 * Checks DJ permission and replies with an error if the check fails.
 * Returns true if permission granted, false if denied (and reply was sent).
 *
 * @param {CommandInteraction} interaction
 * @returns {Promise<boolean>}
 */
async function checkDJPermission(interaction) {
  if (!hasDJPermission(interaction.member)) {
    await interaction.reply({
      embeds: [createErrorEmbed(config.messages.noDJRole)],
      ephemeral: true,
    });
    return false;
  }
  return true;
}

module.exports = {
  hasDJPermission,
  requiresDJ,
  validateVoiceConditions,
  checkDJPermission,
};
