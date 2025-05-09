/**
 * Script to register (deploy) all slash commands in the 'commands' directory (including subfolders) with Discord.
 * Run this script manually whenever you add, remove, or update slash commands.
 * 
 * Usage: node deploy-commands.js
 */

require('dotenv').config();

const fs = require('fs').promises;
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

/**
 * Recursively loads all .js command files from the given directory and its subdirectories.
 */
async function loadCommandsRecursive(dir) {
    let entries;
    try {
        entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (err) {
        console.error(`[ERROR] Failed to read directory ${dir}:`, err);
        process.exit(1);
    }

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await loadCommandsRecursive(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            try {
                const command = require(fullPath);
                if (command?.data?.toJSON) {
                    commands.push(command.data.toJSON());
                } else {
                    console.warn(`[WARN] Skipping invalid command file: ${fullPath}`);
                }
            } catch (err) {
                console.error(`[ERROR] Failed to load command ${fullPath}:`, err);
            }
        }
    }
}

/**
 * Checks for Discord API length limits on command and option names/descriptions.
 * Prints errors and returns true if any violations are found.
 */
function checkCommandLengths(commands) {
    let hasError = false;
    for (const cmd of commands) {
        if (cmd.name.length > 32) {
            console.error(`[ERROR] Command name too long: ${cmd.name}`);
            hasError = true;
        }
        if (cmd.description.length > 100) {
            console.error(`[ERROR] Command description too long: ${cmd.name} - ${cmd.description.length} chars`);
            hasError = true;
        }
        if (cmd.options) {
            for (const opt of cmd.options) {
                if (opt.name.length > 32) {
                    console.error(`[ERROR] Option name too long: ${cmd.name} -> ${opt.name}`);
                    hasError = true;
                }
                if (opt.description.length > 100) {
                    console.error(`[ERROR] Option description too long: ${cmd.name} -> ${opt.name} - ${opt.description.length} chars`);
                    hasError = true;
                }
            }
        }
    }
    return hasError;
}

async function registerCommands() {
    const { CLIENT_ID, GUILD_ID, TOKEN } = process.env;
    if (!CLIENT_ID || !GUILD_ID || !TOKEN) {
        console.error('[ERROR] Missing CLIENT_ID, GUILD_ID, or TOKEN in .env');
        process.exit(1);
    }

    const rest = new REST({ version: '10' }).setToken(TOKEN);

    try {
        console.log(`[INFO] Registering ${commands.length} slash commands to guild ${GUILD_ID}...`);
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );
        console.log('[SUCCESS] Slash commands registered successfully.');
    } catch (error) {
        console.error('[ERROR] Failed to register slash commands:', error);
    }
}

(async () => {
    await loadCommandsRecursive(commandsPath);
    if (checkCommandLengths(commands)) {
        console.error('[ABORTED] One or more commands/options exceed Discord\'s length limits. Fix the above errors and try again.');
        process.exit(1);
    }
    await registerCommands();
})();