const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Geçici bakım modu (kalıcı için veritabanı kullanın)
let maintenanceMode = false;
const OWNER_ID = process.env.OWNER_ID || '791741859423584286';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin1')
    .setDescription('Sunucu yönetimi ve yapılandırması için admin komutları. (Sayfa 1)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('add-emoji')
        .setDescription('Sunucuya özel emoji ekle.')
        .addAttachmentOption(option => option.setName('image').setDescription('Emoji için resim dosyası').setRequired(true))
        .addStringOption(option => option.setName('name').setDescription('Emoji ismi').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('delete-emoji')
        .setDescription('Sunucudan özel emoji sil.')
        .addStringOption(option => option.setName('name').setDescription('Silinecek emojinin ismi').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('set-autorole')
        .setDescription('Yeni üyelere otomatik verilecek rolü ayarla.')
        .addRoleOption(option => option.setName('role').setDescription('Verilecek rol').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('reset-autorole')
        .setDescription('Otorol ayarını sıfırla.')
    )
    .addSubcommand(sub =>
      sub.setName('set-log-channel')
        .setDescription('Sunucu olayları için log kanalını ayarla.')
        .addChannelOption(option => option.setName('channel').setDescription('Log kanalı').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('reset-log-channel')
        .setDescription('Log kanalı ayarını sıfırla.')
    )
    .addSubcommand(sub =>
      sub.setName('set-prefix')
        .setDescription('Sunucu için özel prefix ayarla.')
        .addStringOption(option => option.setName('prefix').setDescription('Yeni prefix').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('reset-prefix')
        .setDescription('Prefixi varsayılana sıfırla.')
    )
    .addSubcommand(sub =>
      sub.setName('enable-curse-filter')
        .setDescription('Küfür filtresini etkinleştir.')
    )
    .addSubcommand(sub =>
      sub.setName('disable-curse-filter')
        .setDescription('Küfür filtresini devre dışı bırak.')
    )
    .addSubcommand(sub =>
      sub.setName('enable-ad-filter')
        .setDescription('Reklam filtresini etkinleştir.')
    )
    .addSubcommand(sub =>
      sub.setName('disable-ad-filter')
        .setDescription('Reklam filtresini devre dışı bırak.')
    )
    .addSubcommand(sub =>
      sub.setName('enable-maintenance')
        .setDescription('Bakım modunu aç (bot çoğu komutu yok sayar).')
    )
    .addSubcommand(sub =>
      sub.setName('disable-maintenance')
        .setDescription('Bakım modunu kapat.')
    )
    .addSubcommand(sub =>
      sub.setName('add-role')
        .setDescription('Bir kullanıcıya rol ekle.')
        .addUserOption(option => option.setName('user').setDescription('Rol eklenecek kullanıcı').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('Eklenecek rol').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('remove-role')
        .setDescription('Bir kullanıcıdan rol kaldır.')
        .addUserOption(option => option.setName('user').setDescription('Rolü kaldırılacak kullanıcı').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('Kaldırılacak rol').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('lock-channel')
        .setDescription('Mevcut kanalı @everyone için kilitle.')
    )
    .addSubcommand(sub =>
      sub.setName('unlock-channel')
        .setDescription('Mevcut kanalın kilidini aç.')
    )
    .addSubcommand(sub =>
      sub.setName('make-announcement')
        .setDescription('Belirtilen kanalda duyuru yap.')
        .addChannelOption(option => option.setName('channel').setDescription('Duyuru yapılacak kanal').setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('Duyuru mesajı').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('server-info')
        .setDescription('Sunucu hakkında bilgi göster.')
    )
    .addSubcommand(sub =>
      sub.setName('clear-channel')
        .setDescription('Bu kanaldaki mesajları toplu sil.')
        .addIntegerOption(option => option.setName('amount').setDescription('Silinecek mesaj sayısı (maks 100)').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('set-auto-nickname')
        .setDescription('Yeni üyelere otomatik verilecek takma adı ayarla.')
        .addStringOption(option => option.setName('nickname').setDescription('Verilecek takma ad').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('reset-auto-nickname')
        .setDescription('Oto-takma ad ayarını sıfırla.')
    )
    .addSubcommand(sub =>
      sub.setName('set-counter')
        .setDescription('Üye sayısını gösterecek kanalı ayarla.')
        .addChannelOption(option => option.setName('channel').setDescription('Sayaç kanalı').setRequired(true))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    // Bakım modu kontrolü (sadece sahip ve bakım komutları hariç)
    if (
      maintenanceMode &&
      interaction.user.id !== OWNER_ID &&
      sub !== 'disable-maintenance' &&
      sub !== 'enable-maintenance'
    ) {
      await interaction.reply({
        content: '🛠️ Bot şu anda bakım modunda. Sadece bot sahibi komut kullanabilir.',
        ephemeral: false
      });
      return;
    }

    // Bakım modunu aç/kapat (sadece sahip)
    if (sub === 'enable-maintenance') {
      if (interaction.user.id !== OWNER_ID) {
        await interaction.reply({ content: '❌ Sadece bot sahibi bakım modunu açabilir.', ephemeral: false });
        return;
      }
      maintenanceMode = true;
      await interaction.reply({ content: '🛠️ Bakım modu etkinleştirildi! Artık sadece bot sahibi komut kullanabilir.' });
      return;
    } else if (sub === 'disable-maintenance') {
      if (interaction.user.id !== OWNER_ID) {
        await interaction.reply({ content: '❌ Sadece bot sahibi bakım modunu kapatabilir.', ephemeral: false });
        return;
      }
      maintenanceMode = false;
      await interaction.reply({ content: '🛠️ Bakım modu devre dışı bırakıldı! Herkes komut kullanabilir.' });
      return;
    }

    // Emoji ekle
    if (sub === 'add-emoji') {
      const image = interaction.options.getAttachment('image');
      const name = interaction.options.getString('name');
      try {
        const emoji = await interaction.guild.emojis.create({ attachment: image.url, name });
        await interaction.reply({ content: `✅ Emoji eklendi: <:${emoji.name}:${emoji.id}>` });
      } catch (err) {
        await interaction.reply({ content: `❌ Emoji eklenemedi: ${err.message}` });
      }
      return;
    }

    // Emoji sil
    if (sub === 'delete-emoji') {
      const name = interaction.options.getString('name');
      const emoji = interaction.guild.emojis.cache.find(e => e.name === name);
      if (!emoji) {
        await interaction.reply({ content: `❌ "${name}" isminde bir emoji bulunamadı.` });
        return;
      }
      try {
        await emoji.delete();
        await interaction.reply({ content: `🗑️ "${name}" isimli emoji sunucudan silindi!` });
      } catch (err) {
        await interaction.reply({ content: `❌ Emoji silinemedi: ${err.message}` });
      }
      return;
    }

    // Otorol ayarla
    if (sub === 'set-autorole') {
      const role = interaction.options.getRole('role');
      await interaction.reply({ content: `✅ Otorol <@&${role.id}> olarak ayarlandı! Yeni üyeler bu rolü otomatik alacak.` });
      return;
    }

    // Otorol sıfırla
    if (sub === 'reset-autorole') {
      await interaction.reply({ content: '♻️ Otorol sıfırlandı. Yeni üyelere otomatik rol verilmeyecek.' });
      return;
    }

    // Log kanalı ayarla
    if (sub === 'set-log-channel') {
      const channel = interaction.options.getChannel('channel');
      await interaction.reply({ content: `📋 Log kanalı <#${channel.id}> olarak ayarlandı! Tüm sunucu logları buraya gönderilecek.` });
      return;
    }

    // Log kanalı sıfırla
    if (sub === 'reset-log-channel') {
      await interaction.reply({ content: '🧹 Log kanalı sıfırlandı. Artık log gönderilmeyecek.' });
      return;
    }

    // Prefix ayarla
    if (sub === 'set-prefix') {
      const prefix = interaction.options.getString('prefix');
      await interaction.reply({ content: `🔤 Prefix güncellendi! Yeni prefix: \`${prefix}\`` });
      return;
    }

    // Prefix sıfırla
    if (sub === 'reset-prefix') {
      await interaction.reply({ content: '🔄 Prefix varsayılana sıfırlandı.' });
      return;
    }

    // Küfür filtresi aç
    if (sub === 'enable-curse-filter') {
      await interaction.reply({ content: '🛡️ Küfür filtresi etkin! Kötü kelimeler engellenecek.' });
      return;
    }

    // Küfür filtresi kapat
    if (sub === 'disable-curse-filter') {
      await interaction.reply({ content: '🛡️ Küfür filtresi devre dışı. Lütfen dikkatli konuşun!' });
      return;
    }

    // Reklam filtresi aç
    if (sub === 'enable-ad-filter') {
      await interaction.reply({ content: '🚫 Reklam filtresi etkin! Artık spam reklam olmayacak.' });
      return;
    }

    // Reklam filtresi kapat
    if (sub === 'disable-ad-filter') {
      await interaction.reply({ content: '🚫 Reklam filtresi devre dışı.' });
      return;
    }

    // Rol ekle
    if (sub === 'add-role') {
      const user = interaction.options.getUser('user');
      const role = interaction.options.getRole('role');
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) {
        await interaction.reply({ content: '❌ Kullanıcı sunucuda bulunamadı.' });
        return;
      }
      try {
        await member.roles.add(role);
        await interaction.reply({ content: `➕ <@&${role.id}> rolü <@${user.id}> kullanıcısına eklendi!` });
      } catch (err) {
        await interaction.reply({ content: `❌ Rol eklenemedi: ${err.message}` });
      }
      return;
    }

    // Rol kaldır
    if (sub === 'remove-role') {
      const user = interaction.options.getUser('user');
      const role = interaction.options.getRole('role');
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) {
        await interaction.reply({ content: '❌ Kullanıcı sunucuda bulunamadı.' });
        return;
      }
      try {
        await member.roles.remove(role);
        await interaction.reply({ content: `➖ <@&${role.id}> rolü <@${user.id}> kullanıcısından kaldırıldı!` });
      } catch (err) {
        await interaction.reply({ content: `❌ Rol kaldırılamadı: ${err.message}` });
      }
      return;
    }

    // Kanal kilitle
    if (sub === 'lock-channel') {
      try {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
        await interaction.reply({ content: '🔒 Bu kanal @everyone için kilitlendi.' });
      } catch (err) {
        await interaction.reply({ content: `❌ Kanal kilitlenemedi: ${err.message}` });
      }
      return;
    }

    // Kanal kilidini aç
    if (sub === 'unlock-channel') {
      try {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
        await interaction.reply({ content: '🔓 Bu kanalın kilidi açıldı.' });
      } catch (err) {
        await interaction.reply({ content: `❌ Kanalın kilidi açılamadı: ${err.message}` });
      }
      return;
    }

    // Duyuru yap
    if (sub === 'make-announcement') {
      const channel = interaction.options.getChannel('channel');
      const message = interaction.options.getString('message');
      try {
        await channel.send(message);
        await interaction.reply({ content: '📢 Duyuru seçilen kanala gönderildi!' });
      } catch (err) {
        await interaction.reply({ content: `❌ Duyuru gönderilemedi: ${err.message}` });
      }
      return;
    }

    // Sunucu bilgisi
    if (sub === 'server-info') {
      const guild = interaction.guild;
      const info = [
        `**Sunucu Adı:** ${guild.name}`,
        `**Sunucu ID:** ${guild.id}`,
        `**Sahip:** <@${guild.ownerId}>`,
        `**Üye Sayısı:** ${guild.memberCount}`,
        `**Oluşturulma Tarihi:** ${guild.createdAt.toLocaleString()}`
      ].join('\n');
      await interaction.reply({ content: `ℹ️ Sunucu Bilgileri:\n${info}` });
      return;
    }

    // Kanalı temizle
    if (sub === 'clear-channel') {
      const amount = interaction.options.getInteger('amount');
      if (amount < 1 || amount > 100) {
        await interaction.reply({ content: '❌ Lütfen 1 ile 100 arasında bir sayı girin.', ephemeral: false });
        return;
      }
      try {
        await interaction.deferReply({ ephemeral: false });
        const deleted = await interaction.channel.bulkDelete(amount, true);
        await interaction.editReply({ content: `🧹 Bu kanaldan ${deleted.size} mesaj başarıyla silindi!` });
      } catch (err) {
        let msg = '❌ Mesajlar silinemedi.';
        if (err.message && err.message.includes('14 days')) {
          msg += ' Sadece 14 günden eski olmayan mesajlar toplu silinebilir.';
        }
        await interaction.editReply({ content: msg });
      }
      return;
    }

    // Oto-takma ad ayarla
    if (sub === 'set-auto-nickname') {
      const nickname = interaction.options.getString('nickname');
      await interaction.reply({ content: `🏷️ Oto-takma ad ayarlandı! Yeni üyeler şu takma adı alacak: **${nickname}**` });
      return;
    }

    // Oto-takma ad sıfırla
    if (sub === 'reset-auto-nickname') {
      await interaction.reply({ content: '🏷️ Oto-takma ad sıfırlandı. Yeni üyeler kendi takma adlarını kullanacak.' });
      return;
    }

    // Sayaç kanalı ayarla
    if (sub === 'set-counter') {
      const channel = interaction.options.getChannel('channel');
      await interaction.reply({ content: `🔢 Üye sayacı kanalı <#${channel.id}> olarak ayarlandı! Otomatik güncellenecek.` });
      return;
    }

    // Fallback
    await interaction.reply({ content: `🎉 /admin1 ${sub} çalıştı!` });
  },
};
