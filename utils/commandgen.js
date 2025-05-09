

const fs = require('fs');
const path = require('path');

// --- Command Specifications ---
// Each entry: name, description, options, permission, template, configKey, reply, and extra fields as needed.
const commandSpecs = [
  // 1. Autorole
  {
    name: 'set-autorole',
    description: 'Set the role to be automatically assigned to new members.',
    options: [{ type: 'role', name: 'role', description: 'The role to assign', required: true }],
    permission: 'Administrator',
    template: 'setConfig',
    configKey: 'autorole',
    reply: (roleVar) => `✅ Autorole set to <@&\${${roleVar}.id}>.`,
  },
  {
    name: 'reset-autorole',
    description: 'Reset the autorole setting.',
    options: [],
    permission: 'Administrator',
    template: 'resetConfig',
    configKey: 'autorole',
    reply: '✅ Autorole has been reset.',
  },
  // 2. Log Channel
  {
    name: 'set-log-channel',
    description: 'Set the log channel for server events.',
    options: [{ type: 'channel', name: 'channel', description: 'The log channel', required: true, channelTypes: ['GuildText'] }],
    permission: 'Administrator',
    template: 'setConfig',
    configKey: 'logChannel',
    reply: (channelVar) => `✅ Log channel set to <#\${${channelVar}.id}>.`,
  },
  {
    name: 'reset-log-channel',
    description: 'Reset the log channel setting.',
    options: [],
    permission: 'Administrator',
    template: 'resetConfig',
    configKey: 'logChannel',
    reply: '✅ Log channel has been reset.',
  },
  // 3. Prefix
  {
    name: 'set-prefix',
    description: 'Set the custom prefix for this server.',
    options: [{ type: 'string', name: 'prefix', description: 'The new prefix', required: true }],
    permission: 'Administrator',
    template: 'setConfigString',
    configKey: 'prefix',
    reply: (prefixVar) => `✅ Prefix set to \\\`${'${' + prefixVar + '}'}\\\`.`,
  },
  {
    name: 'reset-prefix',
    description: 'Reset the custom prefix to default.',
    options: [],
    permission: 'Administrator',
    template: 'resetConfig',
    configKey: 'prefix',
    reply: '✅ Prefix has been reset to default.',
  },
  // 4. Curse Filter
  {
    name: 'enable-curse-filter',
    description: 'Enable the curse word filter.',
    options: [],
    permission: 'Administrator',
    template: 'setConfigBool',
    configKey: 'curseFilter',
    boolValue: true,
    reply: '✅ Curse filter enabled.',
  },
  {
    name: 'disable-curse-filter',
    description: 'Disable the curse word filter.',
    options: [],
    permission: 'Administrator',
    template: 'setConfigBool',
    configKey: 'curseFilter',
    boolValue: false,
    reply: '✅ Curse filter disabled.',
  },
  // 5. Ad Filter
  {
    name: 'enable-ad-filter',
    description: 'Enable the advertisement filter.',
    options: [],
    permission: 'Administrator',
    template: 'setConfigBool',
    configKey: 'adFilter',
    boolValue: true,
    reply: '✅ Advertisement filter enabled.',
  },
  {
    name: 'disable-ad-filter',
    description: 'Disable the advertisement filter.',
    options: [],
    permission: 'Administrator',
    template: 'setConfigBool',
    configKey: 'adFilter',
    boolValue: false,
    reply: '✅ Advertisement filter disabled.',
  },
  // 6. Maintenance
  {
    name: 'enable-maintenance',
    description: 'Enable maintenance mode (bot will ignore most commands).',
    options: [],
    permission: 'Administrator',
    template: 'setConfigBool',
    configKey: 'maintenance',
    boolValue: true,
    reply: '✅ Maintenance mode enabled.',
  },
  {
    name: 'disable-maintenance',
    description: 'Disable maintenance mode.',
    options: [],
    permission: 'Administrator',
    template: 'setConfigBool',
    configKey: 'maintenance',
    boolValue: false,
    reply: '✅ Maintenance mode disabled.',
  },
  // 7. Add/Remove Role
  {
    name: 'add-role',
    description: 'Add a role to a user.',
    options: [
      { type: 'user', name: 'user', description: 'User to add role to', required: true },
      { type: 'role', name: 'role', description: 'Role to add', required: true }
    ],
    permission: 'ManageRoles',
    template: 'addRole',
  },
  {
    name: 'remove-role',
    description: 'Remove a role from a user.',
    options: [
      { type: 'user', name: 'user', description: 'User to remove role from', required: true },
      { type: 'role', name: 'role', description: 'Role to remove', required: true }
    ],
    permission: 'ManageRoles',
    template: 'removeRole',
  },
  // 8. Lock/Unlock Channel
  {
    name: 'lock-channel',
    description: 'Lock the current channel for @everyone.',
    options: [],
    permission: 'ManageChannels',
    template: 'lockChannel',
  },
  {
    name: 'unlock-channel',
    description: 'Unlock the current channel for @everyone.',
    options: [],
    permission: 'ManageChannels',
    template: 'unlockChannel',
  },
  // 9. Emoji
  {
    name: 'add-emoji',
    description: 'Add a custom emoji to the server.',
    options: [
      { type: 'attachment', name: 'image', description: 'Image file for the emoji', required: true },
      { type: 'string', name: 'name', description: 'Name for the emoji', required: true }
    ],
    permission: 'ManageEmojisAndStickers',
    template: 'addEmoji',
  },
  {
    name: 'delete-emoji',
    description: 'Delete a custom emoji from the server.',
    options: [
      { type: 'string', name: 'emoji', description: 'Emoji name or ID', required: true }
    ],
    permission: 'ManageEmojisAndStickers',
    template: 'deleteEmoji',
  },
  // 10. Announcement
  {
    name: 'make-announcement',
    description: 'Make an announcement in a specified channel.',
    options: [
      { type: 'channel', name: 'channel', description: 'Channel to announce in', required: true, channelTypes: ['GuildText'] },
      { type: 'string', name: 'message', description: 'Announcement message', required: true }
    ],
    permission: 'ManageMessages',
    template: 'makeAnnouncement',
  },
  // 11. Server Info
  {
    name: 'server-info',
    description: 'Show information about this server.',
    options: [],
    permission: null,
    template: 'serverInfo',
  },
  // 12. Clear Channel
  {
    name: 'clear-channel',
    description: 'Bulk delete messages in this channel.',
    options: [
      { type: 'integer', name: 'amount', description: 'Number of messages to delete (max 100)', required: true }
    ],
    permission: 'ManageMessages',
    template: 'clearChannel',
  },
  // 13. Auto Nickname
  {
    name: 'set-auto-nickname',
    description: 'Set a nickname to automatically assign to new members.',
    options: [
      { type: 'string', name: 'nickname', description: 'The nickname', required: true }
    ],
    permission: 'Administrator',
    template: 'setConfigString',
    configKey: 'autoNickname',
    reply: (nicknameVar) => `✅ Auto-nickname set to \\\`${'${' + nicknameVar + '}'}\\\`.`,
  },
  {
    name: 'reset-auto-nickname',
    description: 'Reset the auto-nickname setting.',
    options: [],
    permission: 'Administrator',
    template: 'resetConfig',
    configKey: 'autoNickname',
    reply: '✅ Auto-nickname has been reset.',
  },
  // 14. Counter
  {
    name: 'set-counter',
    description: 'Set a channel to display member count.',
    options: [
      { type: 'channel', name: 'channel', description: 'Channel for counter', required: true, channelTypes: ['GuildVoice', 'GuildText'] }
    ],
    permission: 'Administrator',
    template: 'setConfig',
    configKey: 'counterChannel',
    reply: (channelVar) => `✅ Counter channel set to <#\${${channelVar}.id}>.`,
  },
  {
    name: 'reset-counter',
    description: 'Reset the member counter channel.',
    options: [],
    permission: 'Administrator',
    template: 'resetConfig',
    configKey: 'counterChannel',
    reply: '✅ Counter channel has been reset.',
  },
  // 15. Modlog
  {
    name: 'set-modlog',
    description: 'Set the modlog channel.',
    options: [
      { type: 'channel', name: 'channel', description: 'Modlog channel', required: true, channelTypes: ['GuildText'] }
    ],
    permission: 'Administrator',
    template: 'setConfig',
    configKey: 'modlogChannel',
    reply: (channelVar) => `✅ Modlog channel set to <#\${${channelVar}.id}>.`,
  },
  {
    name: 'reset-modlog',
    description: 'Reset the modlog channel setting.',
    options: [],
    permission: 'Administrator',
    template: 'resetConfig',
    configKey: 'modlogChannel',
    reply: '✅ Modlog channel has been reset.',
  },
  // 16. Role Management
  {
    name: 'create-role',
    description: 'Create a new role.',
    options: [
      { type: 'string', name: 'name', description: 'Role name', required: true },
      { type: 'string', name: 'color', description: 'Hex color (optional)', required: false }
    ],
    permission: 'ManageRoles',
    template: 'createRole',
  },
  {
    name: 'delete-role',
    description: 'Delete a role from the server.',
    options: [
      { type: 'role', name: 'role', description: 'Role to delete', required: true }
    ],
    permission: 'ManageRoles',
    template: 'deleteRole',
  },
  // 17. Category
  {
    name: 'create-category',
    description: 'Create a new category channel.',
    options: [
      { type: 'string', name: 'name', description: 'Category name', required: true }
    ],
    permission: 'ManageChannels',
    template: 'createCategory',
  },
];

// --- Permission Mapping ---
const permissionMap = {
  Administrator: 'PermissionFlagsBits.Administrator',
  ManageRoles: 'PermissionFlagsBits.ManageRoles',
  ManageChannels: 'PermissionFlagsBits.ManageChannels',
  ManageMessages: 'PermissionFlagsBits.ManageMessages',
  ManageEmojisAndStickers: 'PermissionFlagsBits.ManageEmojisAndStickers',
};

// --- Option Builder Mapping ---
const optionBuilderMap = {
  string: 'addStringOption',
  integer: 'addIntegerOption',
  role: 'addRoleOption',
  user: 'addUserOption',
  channel: 'addChannelOption',
  attachment: 'addAttachmentOption',
};

// --- Option Type Mapping for getOption ---
const getOptionMap = {
  string: 'getString',
  integer: 'getInteger',
  role: 'getRole',
  user: 'getMember',
  channel: 'getChannel',
  attachment: 'getAttachment',
};

// --- Template Generators ---
const templates = {
  setConfig: (spec) => {
    const option = spec.options[0];
    const optionType = option.type.charAt(0).toUpperCase() + option.type.slice(1);
    const optionVar = option.name;
    let channelTypes = '';
    if (option.type === 'channel' && option.channelTypes) {
      channelTypes = `\n        .addChannelTypes(${option.channelTypes.map(t => `ChannelType.${t}`).join(', ')})`;
    }
    return `const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { setGuildConfig } = require('../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('${spec.name}')
    .setDescription('${spec.description}')
    .add${optionType}Option(option =>
      option.setName('${option.name}')
        .setDescription('${option.description}')
        .setRequired(${option.required})${channelTypes}
    )
    .setDefaultMemberPermissions(${permissionMap[spec.permission]}),
  async execute(interaction) {
    const ${optionVar} = interaction.options.get${optionType}('${option.name}');
    if (!${optionVar}) {
      return interaction.reply({ content: '❌ Invalid ${option.name}.', ephemeral: false });
    }
    setGuildConfig(interaction.guild.id, { ${spec.configKey}: ${optionVar}.id });
    await interaction.reply({ content: \`${spec.reply(optionVar)}\`, ephemeral: false });
  },
};
`;
  },
  setConfigString: (spec) => {
    const option = spec.options[0];
    const optionType = 'String';
    const optionVar = option.name;
    return `const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setGuildConfig } = require('../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('${spec.name}')
    .setDescription('${spec.description}')
    .add${optionType}Option(option =>
      option.setName('${option.name}')
        .setDescription('${option.description}')
        .setRequired(${option.required})
    )
    .setDefaultMemberPermissions(${permissionMap[spec.permission]}),
  async execute(interaction) {
    const ${optionVar} = interaction.options.get${optionType}('${option.name}');
    setGuildConfig(interaction.guild.id, { ${spec.configKey}: ${optionVar} });
    await interaction.reply({ content: \`${spec.reply(optionVar)}\`, ephemeral: false });
  },
};
`;
  },
  setConfigBool: (spec) => {
    return `const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setGuildConfig } = require('../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('${spec.name}')
    .setDescription('${spec.description}')
    .setDefaultMemberPermissions(${permissionMap[spec.permission]}),
  async execute(interaction) {
    setGuildConfig(interaction.guild.id, { ${spec.configKey}: ${spec.boolValue} });
    await interaction.reply({ content: '${spec.reply}', ephemeral: false });
  },
};
`;
  },
  resetConfig: (spec) => {
    return `const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { resetGuildConfigKey } = require('../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('${spec.name}')
    .setDescription('${spec.description}')
    .setDefaultMemberPermissions(${permissionMap[spec.permission]}),
  async execute(interaction) {
    resetGuildConfigKey(interaction.guild.id, '${spec.configKey}');
    await interaction.reply({ content: '${spec.reply}', ephemeral: false });
  },
};
`;
  },
  addRole: (spec) => {
    return `const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('${spec.name}')
    .setDescription('${spec.description}')
    .addUserOption(option => option.setName('user').setDescription('User to add role to').setRequired(true))
    .addRoleOption(option => option.setName('role').setDescription('Role to add').setRequired(true))
    .setDefaultMemberPermissions(${permissionMap[spec.permission]}),
  async execute(interaction) {
    const user = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');
    if (!user || !role) return interaction.reply({ content: '❌ Invalid user or role.', ephemeral: false });
    await user.roles.add(role);
    await interaction.reply({ content: \`✅ Added <@&\${role.id}> to \${user}.\`, ephemeral: false });
  },
};
`;
  },
  removeRole: (spec) => {
    return `const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('${spec.name}')
    .setDescription('${spec.description}')
    .addUserOption(option => option.setName('user').setDescription('User to remove role from').setRequired(true))
    .addRoleOption(option => option.setName('role').setDescription('Role to remove').setRequired(true))
    .setDefaultMemberPermissions(${permissionMap[spec.permission]}),
  async execute(interaction) {
    const user = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');
    if (!user || !role) return interaction.reply({ content: '❌ Invalid user or role.', ephemeral: false });
    await user.roles.remove(role);
    await interaction.reply({ content: \`✅ Removed <@&\${role.id}> from \${user}.\`, ephemeral: false });
  },
};
`;
  },
  lockChannel: (spec) => {
    return `const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('${spec.name}')
    .setDescription('${spec.description}')
    .setDefaultMemberPermissions(${permissionMap[spec.permission]}),
  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
    await interaction.reply({ content: '🔒 Channel locked.', ephemeral: false });
  },
};
`;
  },
  unlockChannel: (spec) => {
    return `const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('${spec.name}')
    .setDescription('${spec.description}')
    .setDefaultMemberPermissions(${permissionMap[spec.permission]}),
  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
    await interaction.reply({ content: '🔓 Channel unlocked.', ephemeral: false });
  },
};
`;
  },
  addEmoji: (spec) => {
    return `const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('${spec.name}')
    .setDescription('${spec.description}')
    .addAttachmentOption(option => option.setName('image').setDescription('Image file for the emoji').setRequired(true))
    .addStringOption(option => option.setName('name').setDescription('Name for the emoji').setRequired(true))
    .setDefaultMemberPermissions(${permissionMap[spec.permission]}),
  async execute(interaction) {
    const image = interaction.options.getAttachment('image');
    const name = interaction.options.getString('name');
    try {
      const emoji = await interaction.guild.emojis.create({ attachment: image.url, name });
      await interaction.reply({ content: \`✅ Emoji added: <:\${emoji.name}:\${emoji.id}>\`, ephemeral: false });
    } catch (err) {
      await interaction.reply({ content: '❌ Failed to add emoji.', ephemeral: false });
    }
  },
};
`;
  },
  deleteEmoji: (spec) => {
    return `const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('${spec.name}')
    .setDescription('${spec.description}')
    .addStringOption(option => option.setName('emoji').setDescription('Emoji name or ID').setRequired(true))
    .setDefaultMemberPermissions(${permissionMap[spec.permission]}),
  async execute(interaction) {
    const emojiInput = interaction.options.getString('emoji');
    const emoji = interaction.guild.emojis.cache.find(e => e.name === emojiInput || e.id === emojiInput.replace(/\\D/g, ''));
    if (!emoji) return interaction.reply({ content: '❌ Emoji not found.', ephemeral: false });
    await emoji.delete();
    await interaction.reply({ content: \`✅ Emoji deleted: \\\`\${emoji.name}\\\`\`, ephemeral: false });
  },
};
`;
  },
  makeAnnouncement: (spec) => {
    return `const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('${spec.name}')
    .setDescription('${spec.description}')
    .addChannelOption(option => option.setName('channel').setDescription('Channel to announce in').addChannelTypes(ChannelType.GuildText).setRequired(true))
    .addStringOption(option => option.setName('message').setDescription('Announcement message').setRequired(true))
    .setDefaultMemberPermissions(${permissionMap[spec.permission]}),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    const embed = new EmbedBuilder()
      .setTitle('📢 Announcement')
      .setDescription(message)
      .setColor(0x5865f2)
      .setTimestamp();
    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: \`✅ Announcement sent in <#\${channel.id}>.\`, ephemeral: false });
  },
};
`;
  },
  serverInfo: (spec) => {
    return `const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('${spec.name}')
    .setDescription('${spec.description}'),
  async execute(interaction) {
    const guild = interaction.guild;
    const embed = new EmbedBuilder()
      .setTitle(\`Server Info: \${guild.name}\`)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: 'Members', value: \`\${guild.memberCount}\`, inline: true },
        { name: 'Roles', value: \`\${guild.roles.cache.size}\`, inline: true },
        { name: 'Channels', value: \`\${guild.channels.cache.size}\`, inline: true },
        { name: 'Owner', value: \`<@\${guild.ownerId}>\`, inline: true },
        { name: 'Created', value: \`<t:\${Math.floor(guild.createdTimestamp / 1000)}:F>\`, inline: true }
      )
      .setColor(0x5865f2)
      .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
`;
  },
  clearChannel: (spec) => {
    return `const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('${spec.name}')
    .setDescription('${spec.description}')
    .addIntegerOption(option => option.setName('amount').setDescription('Number of messages to delete (max 100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .setDefaultMemberPermissions(${permissionMap[spec.permission]}),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    await interaction.channel.bulkDelete(amount, true);
    await interaction.reply({ content: \`✅ Deleted \${amount} messages.\`, ephemeral: false });
  },
};
`;
  },
  createRole: (spec) => {
    return `const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('${spec.name}')
    .setDescription('${spec.description}')
    .addStringOption(option => option.setName('name').setDescription('Role name').setRequired(true))
    .addStringOption(option => option.setName('color').setDescription('Hex color (optional)').setRequired(false))
    .setDefaultMemberPermissions(${permissionMap[spec.permission]}),
  async execute(interaction) {
    const name = interaction.options.getString('name');
    const color = interaction.options.getString('color') || undefined;
    const role = await interaction.guild.roles.create({ name, color });
    await interaction.reply({ content: \`✅ Created role <@&\${role.id}>.\`, ephemeral: false });
  },
};
`;
  },
  deleteRole: (spec) => {
    return `const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('${spec.name}')
    .setDescription('${spec.description}')
    .addRoleOption(option => option.setName('role').setDescription('Role to delete').setRequired(true))
    .setDefaultMemberPermissions(${permissionMap[spec.permission]}),
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    await role.delete();
    await interaction.reply({ content: \`✅ Deleted role \\\`\${role.name}\\\`.\`, ephemeral: false });
  },
};
`;
  },
  createCategory: (spec) => {
    return `const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('${spec.name}')
    .setDescription('${spec.description}')
    .addStringOption(option => option.setName('name').setDescription('Category name').setRequired(true))
    .setDefaultMemberPermissions(${permissionMap[spec.permission]}),
  async execute(interaction) {
    const name = interaction.options.getString('name');
    const category = await interaction.guild.channels.create({ name, type: ChannelType.GuildCategory });
    await interaction.reply({ content: \`✅ Created category \\\`\${category.name}\\\`.\`, ephemeral: false });
  },
};
`;
  },
};

// --- Main Code Generation Function ---
function generateCommands() {
  const adminDir = path.join(__dirname, '../commands/admin');
  if (!fs.existsSync(adminDir)) {
    fs.mkdirSync(adminDir, { recursive: true });
  }

  for (const spec of commandSpecs) {
    const templateFn = templates[spec.template];
    if (!templateFn) {
      console.warn(`No template for command: ${spec.name}`);
      continue;
    }
    const code = templateFn(spec);
    const filePath = path.join(adminDir, `${spec.name}.js`);
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`Generated: ${filePath}`);
  }
}

if (require.main === module) {
  generateCommands();
}

module.exports = {
  generateCommands,
  commandSpecs,
  templates,
};
