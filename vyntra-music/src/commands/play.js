/**
 * Vyntra Music Bot - /play Command
 * Searches and plays music from YouTube or SoundCloud.
 */

const { SlashCommandBuilder, ApplicationCommandOptionType } = require('discord.js');
const { QueryType } = require('discord-player');
const { validateVoiceConditions } = require('../utils/permissions');
const { createErrorEmbed, createTrackAddedEmbed, createEmbed } = require('../utils/embeds');
const { createMusicButtons } = require('../utils/musicButtons');
const config = require('../config/config');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song or playlist from YouTube or SoundCloud.')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Song name, YouTube URL, or SoundCloud URL')
        .setRequired(true)
        .setAutocomplete(false)
    )
    .addStringOption((option) =>
      option
        .setName('source')
        .setDescription('Preferred source for search queries')
        .setRequired(false)
        .addChoices(
          { name: '🎵 YouTube', value: 'youtube' },
          { name: '🔊 SoundCloud', value: 'soundcloud' }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const query = interaction.options.getString('query', true);
    const sourcePreference = interaction.options.getString('source') || 'youtube';

    // Validate voice conditions
    const botVoiceChannel = interaction.guild.members.me?.voice?.channel;
    const validation = validateVoiceConditions(interaction.member, botVoiceChannel);
    if (!validation.valid) {
      return interaction.editReply({ embeds: [validation.embed] });
    }

    const player = interaction.client.player;

    try {
      // Determine query type based on URL detection
      let searchQueryType = determineQueryType(query, sourcePreference);

      // Search for the track
      const searchResult = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: searchQueryType,
      });

      if (!searchResult || searchResult.isEmpty()) {
        return interaction.editReply({
          embeds: [createErrorEmbed(config.messages.searchNoResults)],
        });
      }

      // Get or create the queue
      const queue = player.nodes.create(interaction.guild, {
        metadata: {
          channel: interaction.channel,
          client: interaction.guild.members.me,
          requestedBy: interaction.user,
        },
        selfDeaf: true,
        volume: config.music.defaultVolume,
        leaveOnEmpty: config.music.leaveOnEmpty,
        leaveOnEmptyDelay: config.music.leaveOnEmptyDelay,
        leaveOnEnd: config.music.leaveOnEnd,
        leaveOnEndDelay: config.music.leaveOnEndDelay,
        skipOnNoStream: true,
      });

      // Connect to voice channel if not already connected
      try {
        if (!queue.connection) {
          await queue.connect(interaction.member.voice.channel);
        }
      } catch (connectionError) {
        player.nodes.delete(interaction.guild.id);
        logger.error(`Voice connection error: ${connectionError.message}`);
        return interaction.editReply({
          embeds: [createErrorEmbed(config.messages.connectionError)],
        });
      }

      // Add tracks to queue
      const isPlaylist = searchResult.hasPlaylist();

      if (isPlaylist) {
        queue.addTrack(searchResult.tracks);
      } else {
        queue.addTrack(searchResult.tracks[0]);
      }

      // Start playing if not already
      if (!queue.isPlaying()) {
        await queue.node.play();
      }

      // Build response embed
      if (isPlaylist) {
        const playlist = searchResult.playlist;
        const embed = createEmbed(
          `✅ Added **${searchResult.tracks.length}** tracks from **[${playlist.title}](${playlist.url})** to the queue!`,
          '📋 Playlist Added'
        );
        if (playlist.thumbnail) embed.setThumbnail(playlist.thumbnail);
        return interaction.editReply({ embeds: [embed] });
      } else {
        const track = searchResult.tracks[0];
        const position = queue.tracks.size;
        const embed = createTrackAddedEmbed(track, position);
        const buttons = createMusicButtons(false, queue.repeatMode);
        return interaction.editReply({ embeds: [embed], components: [buttons] });
      }
    } catch (error) {
      logger.error(`Play command error: ${error.message}\n${error.stack}`);
      return interaction.editReply({
        embeds: [createErrorEmbed(`${config.messages.playerError}\n\`${error.message}\``)],
      });
    }
  },
};

/**
 * Determines the appropriate Discord Player QueryType based on the query and user preference.
 * @param {string} query
 * @param {string} sourcePreference
 * @returns {QueryType}
 */
function determineQueryType(query, sourcePreference) {
  const isYouTubeURL =
    query.includes('youtube.com/') || query.includes('youtu.be/');
  const isSoundCloudURL = query.includes('soundcloud.com/');
  const isSpotifyURL = query.includes('spotify.com/');
  const isURL = query.startsWith('http://') || query.startsWith('https://');

  if (isYouTubeURL) {
    if (query.includes('list=')) return QueryType.YOUTUBE_PLAYLIST;
    return QueryType.YOUTUBE_VIDEO;
  }

  if (isSoundCloudURL) {
    if (query.includes('/sets/')) return QueryType.SOUNDCLOUD_PLAYLIST;
    return QueryType.SOUNDCLOUD_TRACK;
  }

  if (isSpotifyURL) {
    if (query.includes('/playlist/')) return QueryType.SPOTIFY_PLAYLIST;
    if (query.includes('/album/')) return QueryType.SPOTIFY_ALBUM;
    return QueryType.SPOTIFY_SONG;
  }

  if (isURL) return QueryType.AUTO;

  // Plain text search — use user's source preference
  if (sourcePreference === 'soundcloud') return QueryType.SOUNDCLOUD_SEARCH;
  return QueryType.YOUTUBE_SEARCH;
}
