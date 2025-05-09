const fs = require('fs');
const path = require('path');

// List of fun commands and their options
const funCommands = [
  { name: 'joke', description: 'Tells you a random joke.' },
  { name: 'caps', description: 'Converts your message to uppercase.', options: [{ type: 'string', name: 'text', description: 'Text to convert', required: true }] },
  { name: 'slap', description: 'Slap another user!', options: [{ type: 'user', name: 'user', description: 'User to slap', required: true }] },
  { name: 'hug', description: 'Give someone a hug!', options: [{ type: 'user', name: 'user', description: 'User to hug', required: true }] },
  { name: 'coinflip', description: 'Flip a coin.' },
  { name: 'roll-dice', description: 'Roll a dice.' },
  { name: 'dog-picture', description: 'Get a random dog picture.' },
  { name: 'cat-picture', description: 'Get a random cat picture.' },
  { name: 'tell-joke', description: 'Tell a joke.' },
  { name: 'gif-search', description: 'Search for a GIF.', options: [{ type: 'string', name: 'keyword', description: 'GIF keyword', required: true }] },
  { name: 'fbi', description: 'FBI open up!' },
  { name: 'love-meter', description: 'Check your love compatibility with someone.', options: [{ type: 'user', name: 'user', description: 'User to check', required: true }] },
  { name: 'jail', description: 'Jail a user!', options: [{ type: 'user', name: 'user', description: 'User to jail', required: true }] },
  { name: 'how-old-am-i', description: 'Guess your age.' },
  { name: 'buy-tea', description: 'Buy a cup of tea.' },
  { name: 'compliment-me', description: 'Get a compliment.' },
  { name: 'make-me-laugh', description: 'Make you laugh.' },
  { name: 'drunk', description: 'Pretend to be drunk.' },
  { name: 'guess-number', description: 'Play a number guessing game.' },
  { name: 'meme', description: 'Get a random meme.' },
  { name: 'scare-me', description: 'Scare yourself with something spooky.' },
  { name: 'fun-fact', description: 'Get a fun fact.' },
  { name: 'anime-suggestion', description: 'Suggest an anime to watch.' },
  { name: 'generate-password', description: 'Generate a random password.' },
  { name: 'steam-game', description: 'Get info about a Steam game.', options: [{ type: 'string', name: 'name', description: 'Game name', required: true }] },
  { name: 'trivia', description: 'Answer a trivia question.' },
  { name: 'give-tip', description: 'Get a random tip.' },
  { name: 'random-emoji', description: 'Get a random emoji.' },
  { name: 'random-song', description: 'Get a random song suggestion.' },
  { name: 'spotify-recommend', description: 'Get a Spotify song recommendation.' }
];

// Option builder mapping
const optionBuilderMap = {
  string: 'addStringOption',
  integer: 'addIntegerOption',
  role: 'addRoleOption',
  user: 'addUserOption',
  channel: 'addChannelOption',
  attachment: 'addAttachmentOption'
};

// Option type mapping for getOption
const getOptionMap = {
  string: 'getString',
  integer: 'getInteger',
  role: 'getRole',
  user: 'getUser',
  channel: 'getChannel',
  attachment: 'getAttachment'
};

const funDir = path.join(__dirname, '../commands/fun');
if (!fs.existsSync(funDir)) fs.mkdirSync(funDir, { recursive: true });

function buildOptionsCode(options) {
  if (!options || options.length === 0) return '';
  return options.map(opt => {
    let builder = `.add${opt.type.charAt(0).toUpperCase() + opt.type.slice(1)}Option(option =>\n      option.setName('${opt.name}')\n        .setDescription('${opt.description}')\n        .setRequired(${opt.required || false})\n    )`;
    return builder;
  }).join('\n    ');
}

function buildGetOptionsCode(options) {
  if (!options || options.length === 0) return '';
  return options.map(opt => {
    const getFn = getOptionMap[opt.type] || 'getString';
    return `    const ${opt.name} = interaction.options.${getFn}('${opt.name}');`;
  }).join('\n');
}

function buildCommandFile(cmd) {
  const optionsCode = buildOptionsCode(cmd.options);
  const getOptionsCode = buildGetOptionsCode(cmd.options);

  return `const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('${cmd.name}')
    .setDescription('${cmd.description}')${optionsCode ? '\n    ' + optionsCode : ''},
  async execute(interaction) {
${getOptionsCode ? getOptionsCode + '\n' : ''}    // TODO: Implement the logic for /${cmd.name}
    await interaction.reply({ content: '🎉 /${cmd.name} çalıştı!', ephemeral: false });
  },
};
`.trim();
}

// Generate all fun command files
funCommands.forEach(cmd => {
  const fileName = `${cmd.name}.js`;
  const filePath = path.join(funDir, fileName);
  fs.writeFileSync(filePath, buildCommandFile(cmd), 'utf8');
  console.log(`Generated: ${filePath}`);
});

console.log('Tüm fun komut dosyaları başarıyla oluşturuldu!');