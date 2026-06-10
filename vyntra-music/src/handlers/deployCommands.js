/**
 * Vyntra Music Bot - Command Deployment Script
 * Run this script to register slash commands with Discord.
 *
 * Usage:
 *   node src/handlers/deployCommands.js           → Deploy to guild (dev)
 *   node src/handlers/deployCommands.js --global  → Deploy globally (production)
 *   node src/handlers/deployCommands.js --clear   → Clear all commands
 */

require('dotenv').config();

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID) {
  console.error('❌ Missing TOKEN or CLIENT_ID in environment variables.');
  process.exit(1);
}

const args = process.argv.slice(2);
const isGlobal = args.includes('--global');
const isClear = args.includes('--clear');

const rest = new REST({ version: '10' }).setToken(TOKEN);

async function deployCommands() {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));

  const commands = [];

  for (const file of commandFiles) {
    try {
      const command = require(path.join(commandsPath, file));
      if (command.data) {
        commands.push(command.data.toJSON());
        console.log(`✅ Loaded command: /${command.data.name}`);
      }
    } catch (error) {
      console.error(`❌ Failed to load ${file}: ${error.message}`);
    }
  }

  if (isClear) {
    console.log('\n🗑️  Clearing all commands...');
    if (isGlobal) {
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
      console.log('✅ Cleared all global commands.');
    } else if (GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] });
      console.log(`✅ Cleared all guild commands for guild ${GUILD_ID}.`);
    }
    return;
  }

  console.log(`\n📤 Deploying ${commands.length} commands...`);

  if (isGlobal) {
    // Global commands (can take up to 1 hour to propagate)
    const data = await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log(`✅ Successfully deployed ${data.length} global slash commands.`);
    console.log('⚠️  Global commands may take up to 1 hour to appear everywhere.');
  } else {
    // Guild commands (instant, for development)
    if (!GUILD_ID) {
      console.error('❌ GUILD_ID is required for guild deployment. Set it in .env or use --global.');
      process.exit(1);
    }
    const data = await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    console.log(`✅ Successfully deployed ${data.length} guild slash commands to guild ${GUILD_ID}.`);
  }
}

deployCommands().catch((error) => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
});
