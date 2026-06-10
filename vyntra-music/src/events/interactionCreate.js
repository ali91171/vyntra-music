/**
 * Vyntra Music Bot - Interaction Create Event
 * Routes slash commands and button interactions to their handlers.
 */

const { InteractionType, ComponentType } = require('discord.js');
const { handleMusicButton } = require('../buttons/musicButtons');
const { createErrorEmbed } = require('../utils/embeds');
const logger = require('../utils/logger');

module.exports = {
  name: 'interactionCreate',
  once: false,

  async execute(interaction, client) {
    // ─────────────────────────────────────────────
    // SLASH COMMAND
    // ─────────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        logger.warn(`[Interaction] Unknown command: /${interaction.commandName}`);
        return interaction.reply({
          embeds: [createErrorEmbed(`Unknown command: \`/${interaction.commandName}\``)],
          ephemeral: true,
        });
      }

      try {
        logger.debug(
          `[Interaction] /${interaction.commandName} used by ${interaction.user.tag} in guild ${interaction.guildId}`
        );
        await command.execute(interaction);
      } catch (error) {
        logger.error(
          `[Interaction] Error executing /${interaction.commandName}: ${error.message}\n${error.stack}`
        );

        const errorEmbed = createErrorEmbed(
          `An unexpected error occurred while running this command.\n\`${error.message}\``
        );

        try {
          if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ embeds: [errorEmbed] });
          } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          }
        } catch (replyError) {
          logger.error(`[Interaction] Failed to send error reply: ${replyError.message}`);
        }
      }
      return;
    }

    // ─────────────────────────────────────────────
    // BUTTON INTERACTION
    // ─────────────────────────────────────────────
    if (interaction.isButton()) {
      const { customId } = interaction;

      // Route all music-related buttons
      if (
        customId.startsWith('music_') ||
        customId.startsWith('queue_')
      ) {
        try {
          await handleMusicButton(interaction);
        } catch (error) {
          logger.error(`[Button] Error handling button ${customId}: ${error.message}`);
          try {
            if (!interaction.replied && !interaction.deferred) {
              await interaction.reply({
                embeds: [createErrorEmbed('An error occurred while handling this button.')],
                ephemeral: true,
              });
            }
          } catch { /* Ignore */ }
        }
      }
      return;
    }

    // ─────────────────────────────────────────────
    // AUTOCOMPLETE (future extensibility)
    // ─────────────────────────────────────────────
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (command?.autocomplete) {
        try {
          await command.autocomplete(interaction);
        } catch (error) {
          logger.error(`[Autocomplete] Error: ${error.message}`);
        }
      }
      return;
    }
  },
};
