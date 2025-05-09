require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes, InteractionType } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const OWNER_ID = process.env.OWNER_ID || '791741859423584286';
 
// Validate required environment variables
const requiredEnv = ['TOKEN', 'CLIENT_ID', 'GUILD_ID'];
for (const key of requiredEnv) {
    const value = process.env[key]?.trim();
    if (!value) {
        console.error(`[ERROR] Missing or invalid "${key}" in .env. Please provide a valid value.`);
        process.exit(1);
    }
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.commands = new Collection();

/**
 * Recursively loads commands from the provided directory.
 * @param {string} dirPath - The directory path to load commands from.
 */
async function loadCommands(dirPath = path.join(__dirname, 'commands')) {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                await loadCommands(fullPath);
            } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts'))) {
                try {
                    // Clear require cache for hot-reloading during development
                    delete require.cache[require.resolve(fullPath)];
                    const command = require(fullPath);
                    if (command?.data?.name && typeof command.execute === 'function') {
                        client.commands.set(command.data.name, command);
                        console.log(`[INFO] Loaded command: ${command.data.name}`);
                    } else {
                        console.warn(`[WARN] Skipping invalid command file: ${fullPath}`);
                    }
                } catch (err) {
                    console.error(`[ERROR] Failed to load command from ${fullPath}:`, err);
                }
            }
        }
    } catch (err) {
        console.error('[ERROR] Failed to read commands directory:', err);
        process.exit(1);
    }
}

/**
 * Registers slash commands with Discord's API.
 */
async function registerSlashCommands() {
    const commands = client.commands.map(cmd => cmd.data?.toJSON ? cmd.data.toJSON() : cmd.data);

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('✅ [SLASH] Slash commands registered!');
    } catch (error) {
        console.error('[ERROR] Failed to register slash commands:', error);
    }
}

client.once('ready', () => {
    console.log(`✅ [READY] Logged in as ${client.user.tag}`);
});

/**
 * Handles all interaction events (slash commands, buttons, modals, etc.).
 */
client.on('interactionCreate', async interaction => {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`[ERROR] Command "${interaction.commandName}" failed:`, error);

            const errorMessage = { content: '❌ There was an error while executing this command!', ephemeral: false };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage).catch(console.error);
            } else {
                await interaction.reply(errorMessage).catch(console.error);
            }
        }
        return;
    }

    // --- TICKET SYSTEM HANDLERS ---
    const ticketCommand = client.commands.get('ticket');

    // Handle ticket close button
    if (interaction.isButton() && interaction.customId === 'ticket_close' && ticketCommand?.handleTicketCloseButton) {
        await ticketCommand.handleTicketCloseButton(interaction);
        return;
    }

    // Handle ticket help menu (dropdown)
    if (interaction.isStringSelectMenu && interaction.customId === 'ticket_help_menu' && ticketCommand?.handleTicketHelpMenu) {
        await ticketCommand.handleTicketHelpMenu(interaction);
        return;
    }

    // --- GENERIC COMPONENT HANDLER (for other commands) ---
    if (interaction.isButton() || interaction.isAnySelectMenu?.()) {
        for (const command of client.commands.values()) {
            if (typeof command.handleComponent === 'function') {
                try {
                    await command.handleComponent(interaction);
                } catch (error) {
                    console.error(`[ERROR] handleComponent failed:`, error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: '❌ There was an error handling this interaction.', ephemeral: false }).catch(console.error);
                    }
                }
            }
        }
        return;
    }

    // Handle modal submissions (e.g., ticket system)
    if (interaction.type === InteractionType.ModalSubmit) {
        for (const command of client.commands.values()) {
            if (typeof command.handleModal === 'function') {
                try {
                    await command.handleModal(interaction);
                } catch (error) {
                    console.error(`[ERROR] handleModal failed:`, error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: '❌ There was an error handling your modal submission.', ephemeral: false }).catch(console.error);
                    }
                }
            }
        }
        return;
    }
});

// Main startup sequence
(async function main() {
    try {
        console.log('[INFO] Starting bot...');
        await loadCommands();
        await registerSlashCommands();
        await client.login(process.env.TOKEN);
        console.log('[INFO] Bot login successful.');
    } catch (err) {
        console.error('[ERROR] Bot startup failed:', err);
        process.exit(1);
        module.exports = client;
    }
})();