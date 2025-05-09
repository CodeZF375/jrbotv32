const fs = require('fs');
const path = require('path');

// Command definitions with relevant replies
const commands = [
  { name: 'help', description: 'Shows a list of all commands and their descriptions.', reply: 'Here is a list of all my commands. Use `/help [command]` for more info!' },
  { name: 'ping', description: 'Replies with Pong and detailed latency stats!', reply: 'Pong! 🏓' },
  { name: 'stats', description: 'Displays bot statistics.', reply: 'Here are my current stats!' },
  { name: 'bot-info', description: 'Shows information about the bot.', reply: 'Here is some information about me!' },
  { name: 'uptime', description: 'Shows how long the bot has been online.', reply: 'I have been online for this long:' },
  { name: 'invite', description: 'Get the invite link to add the bot to your server.', reply: 'Invite me to your server using this link!' },
  { name: 'support', description: 'Get support server link.', reply: 'Join our support server here!' },
  { name: 'server-info', description: 'Shows information about the current server.', reply: 'Here is information about this server.' },
  { name: 'user-info', description: 'Shows information about a user.', reply: 'Here is some information about you!' },
  { name: 'avatar', description: 'Shows the avatar of a user.', reply: 'Here is the avatar you requested!' },
  { name: 'server-avatar', description: 'Shows the server\'s icon.', reply: 'Here is the server\'s avatar!' },
  { name: 'banner', description: 'Shows the server or user banner.', reply: 'Here is the banner you requested!' },
  { name: 'poll', description: 'Create a poll with a question.', reply: 'Poll created! Cast your votes below.' },
  { name: 'translate', description: 'Translate text to another language.', reply: 'Here is your translated text:' },
  { name: 'weather', description: 'Get the weather for a city.', reply: 'Here is the current weather:' },
  { name: 'time', description: 'Get the current time.', reply: 'Here is the current time:' },
  { name: 'add-note', description: 'Add a personal note.', reply: 'Your note has been added!' },
  { name: 'my-notes', description: 'View your notes.', reply: 'Here are your notes:' },
  { name: 'delete-note', description: 'Delete one of your notes.', reply: 'Your note has been deleted.' },
  { name: 'reminder', description: 'Set a reminder.', reply: 'Reminder set! I will notify you.' },
  { name: 'daily-message', description: 'Get your daily message.', reply: 'Here is your daily message!' },
  { name: 'create-profile', description: 'Create your user profile.', reply: 'Your profile has been created!' },
  { name: 'update-profile', description: 'Update your user profile.', reply: 'Your profile has been updated!' },
  { name: 'delete-profile', description: 'Delete your user profile.', reply: 'Your profile has been deleted.' },
  { name: 'commands', description: 'List all available commands.', reply: 'Here are all my available commands:' },
  { name: 'bot-version', description: 'Show the current bot version.', reply: 'My current version is:' },
  { name: 'developer', description: 'Show information about the developer.', reply: 'This bot was developed by:' },
  { name: 'links', description: 'Show useful links.', reply: 'Here are some useful links:' },
  { name: 'suggest', description: 'Suggest a feature or improvement.', reply: 'Thank you for your suggestion!' },
  { name: 'task-help', description: 'Get help with tasks.', reply: 'How can I assist you with your tasks?' },
];

// Directory to output commands
const outputDir = path.join(__dirname, '../commands/general');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const template = (name, description, reply) => `const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: '${name}',
        description: '${description}',
    },
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x00FFB3)
            .setTitle('Command: /${name}')
            .setDescription('${reply}')
            .setFooter({ text: \`Requested by \${interaction.user.tag}\`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: false });
    },
};
`;

commands.forEach(cmd => {
  const filePath = path.join(outputDir, `${cmd.name}.js`);
  fs.writeFileSync(filePath, template(cmd.name, cmd.description, cmd.reply), 'utf8');
  console.log(`Created: ${filePath}`);
});

console.log('All general command files have been generated!');