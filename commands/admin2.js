const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const OWNER_ID = process.env.OWNER_ID || '791741859423584286';

// Temel renk isimleri ve hex karşılıkları
const BASIC_COLORS = {
  red: '#ff0000',
  blue: '#3498db',
  green: '#57f287',
  yellow: '#fee75c',
  orange: '#ff9900',
  purple: '#9b59b6',
  pink: '#ff66cc',
  black: '#23272a',
  white: '#ffffff',
  gray: '#99aab5',
  grey: '#99aab5',
  aqua: '#1abc9c',
  gold: '#f1c40f',
  brown: '#a0522d',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin2')
    .setDescription('Sunucu yönetimi ve yapılandırması için admin komutları. (Sayfa 2)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('set-modlog')
        .setDescription('Modlog kanalını ayarla.')
        .addChannelOption(option => option.setName('channel').setDescription('Modlog olarak kullanılacak kanal').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('reset-modlog')
        .setDescription('Modlog kanalı ayarını sıfırla.')
    )
    .addSubcommand(sub =>
      sub.setName('create-role')
        .setDescription('Yeni bir rol oluştur.')
        .addStringOption(option => option.setName('name').setDescription('Rol ismi').setRequired(true))
        .addStringOption(option => option.setName('color').setDescription('Rol rengi (hex veya temel renk ismi)').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('delete-role')
        .setDescription('Sunucudan bir rol sil.')
        .addRoleOption(option => option.setName('role').setDescription('Silinecek rol').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('create-category')
        .setDescription('Yeni bir kategori kanalı oluştur.')
        .addStringOption(option => option.setName('name').setDescription('Kategori ismi').setRequired(true))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'set-modlog') {
      const channel = interaction.options.getChannel('channel');
      // Kanalı veritabanına/config'e kaydedin
      await interaction.reply({ content: `📝 Modlog kanalı <#${channel.id}> olarak ayarlandı!` });
    } else if (sub === 'reset-modlog') {
      // Modlog kanalını veritabanından/config'den silin
      await interaction.reply({ content: '🧹 Modlog kanalı sıfırlandı.' });
    } else if (sub === 'create-role') {
      const name = interaction.options.getString('name');
      let color = interaction.options.getString('color');
      let colorHex = undefined;

      if (color) {
        color = color.trim().toLowerCase();
        if (BASIC_COLORS[color]) {
          colorHex = BASIC_COLORS[color];
        } else if (/^#?[0-9a-fA-F]{6}$/.test(color)) {
          colorHex = color.startsWith('#') ? color : `#${color}`;
        } else {
          await interaction.reply({ content: '❌ Lütfen geçerli bir hex renk (örn. #ff0000 veya ff0000) veya temel bir renk ismi (örn. red, blue, green) girin.', ephemeral: false });
          return;
        }
      }

      try {
        const role = await interaction.guild.roles.create({
          name,
          color: colorHex,
          reason: `${interaction.user.tag} tarafından /admin2 create-role ile oluşturuldu`
        });
        await interaction.reply({ content: `✅ Rol oluşturuldu: <@&${role.id}>${colorHex ? ` (Renk: ${colorHex})` : ''}` });
      } catch (err) {
        await interaction.reply({ content: `❌ Rol oluşturulamadı: ${err.message}` });
      }
    } else if (sub === 'delete-role') {
      const role = interaction.options.getRole('role');
      try {
        await role.delete(`${interaction.user.tag} tarafından /admin2 delete-role ile silindi`);
        await interaction.reply({ content: `🗑️ <@&${role.id}> rolü sunucudan silindi!` });
      } catch (err) {
        await interaction.reply({ content: `❌ Rol silinemedi: ${err.message}` });
      }
    } else if (sub === 'create-category') {
      const name = interaction.options.getString('name');
      try {
        const category = await interaction.guild.channels.create({
          name,
          type: ChannelType.GuildCategory,
          reason: `${interaction.user.tag} tarafından /admin2 create-category ile oluşturuldu`
        });
        await interaction.reply({ content: `📁 Kategori oluşturuldu: **${category.name}**` });
      } catch (err) {
        await interaction.reply({ content: `❌ Kategori oluşturulamadı: ${err.message}` });
      }
    } else {
      await interaction.reply({ content: `🎉 /admin2 ${sub} çalıştı!` });
    }
  },
};
