# 🎵 Vyntra Music Bot

A production-ready Discord music bot built with **Discord.js v14** and **Discord Player**, supporting YouTube and SoundCloud with slash commands, rich embeds, and interactive buttons.

---

## ✨ Features

- 🎵 Play music from **YouTube** and **SoundCloud** (URLs + search)
- 📋 Full queue system with pagination
- 🔁 Loop modes: Track, Queue, Autoplay
- 🎛️ Interactive buttons: Pause, Resume, Skip, Stop, Loop, Shuffle
- 🎨 Professional embedded messages with progress bar
- 🛡️ DJ role permission system
- 🔊 Volume control
- 🤖 Auto-disconnect when voice channel empties
- 📡 Slash commands only (no prefix)
- 🚂 Railway deployment ready

---

## 📋 Commands

| Command | Description |
|---|---|
| `/play <query>` | Play a song or playlist by name or URL |
| `/skip [amount]` | Skip current or multiple songs |
| `/stop` | Stop music and clear the queue |
| `/pause` | Pause the current song |
| `/resume` | Resume the paused song |
| `/queue [page]` | View the queue with pagination |
| `/nowplaying` | Show the current song with progress |
| `/volume [level]` | Get or set playback volume |
| `/loop <mode>` | Set loop mode (off/track/queue/autoplay) |
| `/autoplay` | Toggle autoplay mode |
| `/shuffle` | Shuffle the queue |
| `/remove <position>` | Remove a song from the queue |
| `/clear` | Clear all queued songs |

---

## 🚀 Quick Start

### Prerequisites

- Node.js **v18 or higher**
- A Discord bot application with a token
- Bot invited to your server with `bot` and `applications.commands` scopes

### 1. Clone & Install

```bash
git clone https://github.com/ali91171/vyntra-music.git
cd vyntra-music
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
TOKEN=your_bot_token
CLIENT_ID=your_application_id
GUILD_ID=your_guild_id   # For dev — leave blank for global commands
```

### 3. Deploy Commands

```bash
# Development (guild commands — instant)
node src/handlers/deployCommands.js

# Production (global commands — up to 1 hour)
node src/handlers/deployCommands.js --global
```

### 4. Start the Bot

```bash
npm start
```

---

## 🚂 Railway Deployment

### Method 1: GitHub + Railway (Recommended)

1. Push your project to a GitHub repository
2. Go to [railway.app](https://railway.app) and create a new project
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway will auto-detect `railway.json` and build automatically
6. Go to **Variables** tab and add:
   - `TOKEN` = your bot token
   - `CLIENT_ID` = your application ID
   - `NODE_ENV` = `production`
7. The bot will deploy and start automatically

### Method 2: Railway CLI

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

Then add environment variables:
```bash
railway variables set TOKEN=your_token
railway variables set CLIENT_ID=your_client_id
railway variables set NODE_ENV=production
```

### Important Notes for Railway

- Use the **worker** Procfile type (not `web`) — the bot does not serve HTTP
- Railway will restart the bot automatically on crashes (configured in `railway.json`)
- Set `NODE_ENV=production` to disable debug logging

---

## ⚙️ Configuration

All bot settings are in `src/config/config.js`:

### Bot Settings
```js
bot: {
  name: 'Vyntra Music',
  embedColor: '#5865F2',   // Main embed color
  footerText: '🎵 Vyntra Music',
  activity: { type: 'LISTENING', name: '/play | Vyntra Music' }
}
```

### Music Settings
```js
music: {
  defaultVolume: 80,
  maxVolume: 100,
  leaveOnEmpty: true,
  leaveOnEmptyDelay: 30000,    // 30 seconds
  leaveOnEnd: false,
  leaveOnEndDelay: 300000,     // 5 minutes
}
```

### DJ Role System
```js
permissions: {
  djRoles: ['ROLE_ID_HERE'],   // Leave empty for everyone
  adminRoles: ['ADMIN_ROLE_ID'],
  djCommands: ['stop', 'skip', 'remove', 'shuffle', 'clear', 'volume', 'loop'],
}
```

---

## 🗂️ Project Structure

```
vyntra-music/
├── src/
│   ├── commands/          # Slash command files
│   │   ├── play.js
│   │   ├── skip.js
│   │   ├── stop.js
│   │   ├── pause.js
│   │   ├── resume.js
│   │   ├── queue.js
│   │   ├── nowplaying.js
│   │   ├── volume.js
│   │   ├── loop.js
│   │   ├── shuffle.js
│   │   ├── remove.js
│   │   ├── clear.js
│   │   └── autoplay.js
│   ├── events/            # Discord.js event handlers
│   │   ├── ready.js
│   │   ├── interactionCreate.js
│   │   ├── voiceStateUpdate.js
│   │   └── error.js
│   ├── handlers/          # Loaders & deployers
│   │   ├── commandHandler.js
│   │   ├── eventHandler.js
│   │   ├── playerEvents.js
│   │   └── deployCommands.js
│   ├── buttons/           # Button interaction logic
│   │   └── musicButtons.js
│   ├── music/             # Player initialization
│   │   └── player.js
│   ├── utils/             # Shared utilities
│   │   ├── logger.js
│   │   ├── embeds.js
│   │   ├── permissions.js
│   │   └── musicButtons.js
│   ├── config/
│   │   └── config.js
│   └── index.js           # Entry point
├── .env.example
├── .gitignore
├── package.json
├── railway.json
├── Procfile
└── README.md
```

---

## 🔐 Bot Permissions

When inviting your bot, make sure to enable these permissions:

- `Send Messages`
- `Embed Links`
- `Read Message History`
- `Add Reactions`
- `Connect` (voice)
- `Speak` (voice)
- `Use Application Commands`

**OAuth2 Scopes:** `bot`, `applications.commands`

---

## 🛠️ Troubleshooting

**Bot doesn't respond to commands**
- Ensure commands are deployed: `node src/handlers/deployCommands.js`
- Check that `CLIENT_ID` matches your application ID (not the bot ID)
- Verify the bot has `Use Application Commands` permission

**No audio plays**
- Ensure `ffmpeg` is available (bundled via `ffmpeg-static`)
- Check that the bot has `Connect` and `Speak` permissions in the voice channel
- Try adding a YouTube cookie in `.env` if YouTube blocks requests

**Railway crashes on startup**
- Check Railway logs for the error message
- Ensure `TOKEN` and `CLIENT_ID` are set in Railway Variables
- Make sure Node.js version is ≥ 18 (Railway uses the `engines` field in `package.json`)

---

## 📄 License

MIT — Free to use, modify, and distribute.

---

*Made with ❤️ — Vyntra Music*
