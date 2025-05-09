const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const OWNER_ID = process.env.OWNER_ID || '791741859423584286';
const MUTED_ROLE_ID = '1279751175570460724';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mod')
    .setDescription('Sunucu yetkilileri için moderasyon komutları.')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addSubcommand(sub =>
      sub.setName('kick')
        .setDescription('Bir kullanıcıyı sunucudan at.')
        .addUserOption(opt => opt.setName('user').setDescription('Atılacak kullanıcı').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Atılma sebebi').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('ban')
        .setDescription('Bir kullanıcıyı sunucudan yasakla.')
        .addUserOption(opt => opt.setName('user').setDescription('Yasaklanacak kullanıcı').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Yasaklama sebebi').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('mute')
        .setDescription('Bir kullanıcıyı sustur.')
        .addUserOption(opt => opt.setName('user').setDescription('Susturulacak kullanıcı').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Susturma sebebi').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('unmute')
        .setDescription('Bir kullanıcının susturmasını kaldır.')
        .addUserOption(opt => opt.setName('user').setDescription('Susturması kaldırılacak kullanıcı').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('warn')
        .setDescription('Bir kullanıcıyı uyar.')
        .addUserOption(opt => opt.setName('user').setDescription('Uyarılacak kullanıcı').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Uyarı sebebi').setRequired(false))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'kick') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'Sebep belirtilmedi';
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) {
        await interaction.reply({ content: `❌ Kullanıcı bu sunucuda bulunamadı.` });
        return;
      }
      try {
        await member.kick(reason);
        await interaction.reply({ content: `👢 ${user} sunucudan atıldı! Sebep: ${reason}` });
      } catch (err) {
        await interaction.reply({ content: `❌ Kullanıcı atılamadı: ${err.message}` });
      }
    } else if (sub === 'ban') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'Sebep belirtilmedi';
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) {
        await interaction.reply({ content: `❌ Kullanıcı bu sunucuda bulunamadı.` });
        return;
      }
      try {
        await member.ban({ reason });
        await interaction.reply({ content: `🔨 ${user} sunucudan yasaklandı! Sebep: ${reason}` });
      } catch (err) {
        await interaction.reply({ content: `❌ Kullanıcı yasaklanamadı: ${err.message}` });
      }
    } else if (sub === 'mute') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'Sebep belirtilmedi';
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) {
        await interaction.reply({ content: `❌ Kullanıcı bu sunucuda bulunamadı.` });
        return;
      }
      try {
        await member.roles.add(MUTED_ROLE_ID, `Susturan: ${interaction.user.tag} | Sebep: ${reason}`);
        await interaction.reply({ content: `🔇 ${user} susturuldu! Sebep: ${reason}` });
      } catch (err) {
        await interaction.reply({ content: `❌ Kullanıcı susturulamadı: ${err.message}` });
      }
    } else if (sub === 'unmute') {
      const user = interaction.options.getUser('user');
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) {
        await interaction.reply({ content: `❌ Kullanıcı bu sunucuda bulunamadı.` });
        return;
      }
      try {
        await member.roles.remove(MUTED_ROLE_ID, `Susturmayı kaldıran: ${interaction.user.tag}`);
        await interaction.reply({ content: `🔊 ${user} artık susturulmadı!` });
      } catch (err) {
        await interaction.reply({ content: `❌ Kullanıcının susturması kaldırılamadı: ${err.message}` });
      }
    } else if (sub === 'warn') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'Sebep belirtilmedi';
      await interaction.reply({ content: `⚠️ ${user} uyarıldı! Sebep: ${reason}` });
    } else {
      await interaction.reply({ content: `🎉 /mod ${sub} çalıştı!` });
    }
  },
};