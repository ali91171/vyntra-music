/**
 * Vyntra Music Bot - Central Configuration
 * All bot behavior, appearance, and settings are controlled here.
 */

module.exports = {
  // ─────────────────────────────────────────────
  // BOT SETTINGS
  // ─────────────────────────────────────────────
  bot: {
    name: 'Vyntra Music',
    version: '1.0.0',
    prefix: '/', // Slash commands only
    embedColor: '#5865F2', // Discord Blurple
    errorColor: '#ED4245', // Discord Red
    successColor: '#57F287', // Discord Green
    warningColor: '#FEE75C', // Discord Yellow
    footerText: '🎵 Vyntra Music | High Quality Audio',
    footerIcon: null, // Set to a URL for a custom footer icon
    activity: {
      type: 'LISTENING', // PLAYING | LISTENING | WATCHING | COMPETING
      name: '/play | Vyntra Music',
    },
    supportServer: null, // Optional: your support server invite link
  },

  // ─────────────────────────────────────────────
  // MUSIC SETTINGS
  // ─────────────────────────────────────────────
  music: {
    defaultVolume: 80, // Default playback volume (0-100)
    maxVolume: 100, // Maximum allowed volume
    leaveOnEmpty: true, // Leave voice channel when it becomes empty
    leaveOnEmptyDelay: 30000, // Delay before leaving empty VC (ms) — 30 seconds
    leaveOnEnd: false, // Leave voice channel when queue ends
    leaveOnEndDelay: 300000, // Delay before leaving after queue ends (ms) — 5 minutes
    savePreviousTracks: true, // Keep previous tracks history
    maxQueueSize: 500, // Maximum tracks allowed in queue (0 = unlimited)
    defaultLoopMode: 0, // 0 = Off, 1 = Track, 2 = Queue, 3 = Autoplay
    searchResultCount: 5, // Number of search results to show
    progressBarLength: 20, // Length of the progress bar in characters
    thumbnailSize: 'maxresdefault', // YouTube thumbnail quality: default | mqdefault | hqdefault | sddefault | maxresdefault
    enableFilters: true, // Enable audio filters (bass boost, etc.)
    connectionTimeout: 20000, // Voice connection timeout (ms)
  },

  // ─────────────────────────────────────────────
  // PERMISSIONS
  // ─────────────────────────────────────────────
  permissions: {
    // Role IDs that have DJ access (can use all music commands)
    // Set to empty array [] to disable DJ role requirement
    djRoles: [],

    // Role IDs with admin-level bot access (bypass all restrictions)
    adminRoles: [],

    // Commands that require DJ role or admin
    djCommands: ['stop', 'skip', 'remove', 'shuffle', 'clear', 'volume', 'loop'],

    // Allow queue viewing without DJ role
    allowQueueView: true,

    // Allow nowplaying without DJ role
    allowNowPlaying: true,

    // Require the bot and user to be in the same voice channel
    requireSameVoiceChannel: true,
  },

  // ─────────────────────────────────────────────
  // MESSAGES
  // ─────────────────────────────────────────────
  messages: {
    noVoiceChannel: '❌ You need to be in a voice channel to use this command.',
    notSameChannel: '❌ You need to be in the same voice channel as me.',
    noDJRole: '❌ You need a DJ role to use this command.',
    noQueue: '❌ There is no active queue right now.',
    emptyQueue: '❌ The queue is currently empty.',
    noCurrentTrack: '❌ There is no track currently playing.',
    invalidVolume: '❌ Please provide a valid volume between 0 and 100.',
    invalidPosition: '❌ Please provide a valid position in the queue.',
    searchNoResults: '❌ No results found for your search query.',
    playerError: '❌ An error occurred while trying to play this track.',
    connectionError: '❌ Failed to connect to the voice channel.',
    botNoPermission: '❌ I do not have permission to join or speak in that voice channel.',
    queueFull: `❌ The queue is full. Maximum ${500} tracks allowed.`,
    trackAdded: '✅ Added **{title}** to the queue!',
    trackAddedPosition: '✅ Added **{title}** to position **#{position}** in the queue!',
    playlistAdded: '✅ Added **{count}** tracks from **{title}** to the queue!',
    skipped: '⏭️ Skipped **{title}**.',
    stopped: '⏹️ Stopped the player and cleared the queue.',
    paused: '⏸️ Paused **{title}**.',
    resumed: '▶️ Resumed **{title}**.',
    shuffled: '🔀 Shuffled the queue!',
    cleared: '🗑️ Cleared the queue.',
    removed: '🗑️ Removed **{title}** from the queue.',
    volumeSet: '🔊 Volume set to **{volume}%**.',
    loopOff: '🔁 Loop disabled.',
    loopTrack: '🔂 Now looping the current track.',
    loopQueue: '🔁 Now looping the entire queue.',
    autoplay: '✨ Autoplay enabled.',
    disconnected: '👋 Disconnected from voice channel.',
    autoDisconnect: '👋 Left the voice channel due to inactivity.',
  },

  // ─────────────────────────────────────────────
  // LOGGING
  // ─────────────────────────────────────────────
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    colorize: process.env.NODE_ENV !== 'production',
    logToFile: false, // Set to true to also log to files
    logDir: './logs', // Directory for log files if logToFile is true
  },

  // ─────────────────────────────────────────────
  // AUDIO FILTERS (Discord Player)
  // ─────────────────────────────────────────────
  filters: {
    bassboost: 'bass=g=20,dynaudnorm=f=200',
    '8D': 'apulsator=hz=0.08',
    vaporwave: 'aresample=48000,asetrate=48000*0.8',
    nightcore: 'aresample=48000,asetrate=48000*1.25',
    phaser: 'aphaser=in_gain=0.4',
    tremolo: 'tremolo',
    vibrato: 'vibrato=f=6.5',
    reverse: 'areverse',
    treble: 'treble=g=5',
    normalizer: 'dynaudnorm=f=200',
    surrounding: 'surround',
    pulsator: 'apulsator=hz=1',
    subboost: 'asubboost',
    karaoke: 'stereotools=mleft=0:mright=0',
    flanger: 'flanger',
    gate: 'agate',
    haas: 'haas',
    mcompand: 'mcompand',
  },
};
