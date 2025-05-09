const { SlashCommandBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { loadConfig, saveConfig } = require('../utils/ticketUtils');

const OWNER_ID = process.env.OWNER_ID || '791741859423584286';

function isOwner(user) {
  return user.id === OWNER_ID;
}

function hasAdminRole(member, config) {
  return config.adminRoleId && member.roles.cache.has(config.adminRoleId);
}

function sanitizeChannelName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 90);
}

function getTicketOwnerFromTopic(topic) {
  const match = topic && topic.match(/Ticket Owner: (\d+)/);
  return match ? match[1] : null;
}

async function sendTicketWelcomeEphemeral(interaction, channel, userId, supportRoleId) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_close')
      .setLabel('🔒 Bileti Kapat')
      .setStyle(ButtonStyle.Danger)
  );
  await channel.send({
    content:
      `🎫 **Hoş geldin <@${userId}>!**\n\n` +
      `Yardıma mı ihtiyacın var? Aşağıdaki menüden konunu seç ve destek ekibimizle iletişime geç!\n` +
      `<@&${supportRoleId}> ekibimiz kısa sürede seninle ilgilenecek.\n\n` +
      `Bu bileti istediğin zaman aşağıdaki butona tıklayarak kapatabilirsin.`,
    components: [row]
  });
}

async function sendTicketMenu(interaction) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('ticket_help_menu')
    .setPlaceholder('📝 Destek konunu seç...')
    .addOptions([
      { label: 'Genel Yardım', value: 'general-help', description: 'Genel sorular ve yardım', emoji: '💬' },
      { label: 'Hata Bildir', value: 'bug-report', description: 'Bir hata veya sorun bildir', emoji: '🐞' },
      { label: 'Yetkili Desteği', value: 'staff-support', description: 'Doğrudan yetkiliyle iletişim', emoji: '🛡️' },
      { label: 'İtiraz', value: 'appeal', description: 'Cezaya/ban itirazı', emoji: '📄' },
      { label: 'Kullanıcı Bildir', value: 'report-user', description: 'Kötü davranışlı kullanıcıyı bildir', emoji: '🚨' },
      { label: 'Satın Alma Sorunu', value: 'purchase-issue', description: 'Satın alma/ödeme sorunları', emoji: '💸' },
      { label: 'Öneri', value: 'feature-request', description: 'Yeni özellik öner', emoji: '✨' },
      { label: 'Partnerlik', value: 'partnership', description: 'Partnerlik başvurusu', emoji: '🤝' },
      { label: 'Teknik Destek', value: 'technical-support', description: 'Teknik sorunlar veya hatalar', emoji: '🛠️' }
    ]);
  const row = new ActionRowBuilder().addComponents(menu);

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('💡 Yardıma mı ihtiyacın var?')
    .setDescription(
      "Destek merkezine hoş geldin!\n\n" +
      "Aşağıdaki menüden sorununa en uygun konuyu seç, destek ekibimiz en kısa sürede seninle ilgilenecek.\n\n" +
      "Emin değilsen **Genel Yardım**'ı seçebilirsin."
    )
    .setThumbnail('https://cdn-icons-png.flaticon.com/512/1828/1828817.png')
    .setFooter({ text: 'Destek Ekibi', iconURL: 'https://cdn-icons-png.flaticon.com/512/1828/1828817.png' });

  await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: false
  });
}

async function handleTicketHelpMenu(interaction) {
  if (!interaction.isStringSelectMenu() || interaction.customId !== 'ticket_help_menu') return;
  const config = loadConfig();
  const value = interaction.values[0];
  const user = interaction.user;

  // Kullanıcının zaten açık bileti var mı?
  const existing = interaction.guild.channels.cache.find(
    ch =>
      ch.parentId === config.ticketCategoryId &&
      ch.topic &&
      ch.topic.includes(`Ticket Owner: ${user.id}`)
  );
  if (existing) {
    await interaction.reply({ content: `❗ Zaten açık bir biletin var: <#${existing.id}>`, ephemeral: true });
    return;
  }

  // Bilet kanalı oluştur
  const channelName = sanitizeChannelName(`bilet-${user.username}`);
  const category = interaction.guild.channels.cache.get(config.ticketCategoryId);
  if (!category || category.type !== ChannelType.GuildCategory) {
    await interaction.reply({ content: '❌ Bilet kategorisi geçersiz. Lütfen bir yetkiliye `/ticket settings` ile kontrol ettir.', ephemeral: true });
    return;
  }
  let ticketChannel;
  try {
    ticketChannel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category.id,
      topic: `Ticket Owner: ${user.id} | Açılış: ${new Date().toISOString()} | Konu: ${value}`,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone.id,
          deny: ['ViewChannel'],
        },
        {
          id: user.id,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        },
        {
          id: config.supportRoleId,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        },
      ],
    });
  } catch (err) {
    await interaction.reply({ content: `❌ Bilet kanalı oluşturulamadı: ${err.message}`, ephemeral: true });
    return;
  }
  await sendTicketWelcomeEphemeral(interaction, ticketChannel, user.id, config.supportRoleId);
  await interaction.reply({ content: `✅ Biletin oluşturuldu: <#${ticketChannel.id}>`, ephemeral: true });
}

async function handleTicketCloseButton(interaction) {
  if (!interaction.isButton() || interaction.customId !== 'ticket_close') return;
  const config = loadConfig();
  const ownerId = getTicketOwnerFromTopic(interaction.channel.topic);
  const isAdmin = isOwner(interaction.user) || hasAdminRole(interaction.member, config);

  if (
    ownerId &&
    interaction.user.id !== ownerId &&
    !isAdmin
  ) {
    await interaction.reply({ content: '❌ Bu bileti sadece sahibi, admin veya bot sahibi kapatabilir.', ephemeral: false });
    return;
  }

  await interaction.reply({ content: '🔒 Bu bilet 5 saniye içinde kapatılıp silinecek.', ephemeral: false });

  // Kanal silindikten sonra DM gönder
  setTimeout(async () => {
    try {
      const user = await interaction.client.users.fetch(ownerId);
      let dmMessage = config.dmTemplate
        ? config.dmTemplate.replace(/\{user\}/g, `<@${ownerId}>`)
        : '🔒 Biletin kapatıldı. Tekrar yardıma ihtiyacın olursa yeni bir bilet açabilirsin!';
      await user.send(dmMessage).catch(() => {});
    } catch (e) {
      // DM hatalarını yoksay
    }
    interaction.channel.delete().catch(() => {});
  }, 5000);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Bilet sistemi yönetimi ve işlemleri')
    .addSubcommand(sub => sub.setName('open').setDescription('Yeni bir destek bileti aç'))
    .addSubcommand(sub => sub.setName('close').setDescription('Mevcut bileti kapat'))
    .addSubcommand(sub => sub.setName('set-role').setDescription('Destek rolünü ayarla').addRoleOption(opt => opt.setName('role').setDescription('Destek rolü').setRequired(true)))
    .addSubcommand(sub => sub.setName('set-log').setDescription('Bilet log kanalını ayarla').addChannelOption(opt => opt.setName('channel').setDescription('Log kanalı').addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand(sub => sub.setName('faq').setDescription('Bilet SSS / yardımını göster'))
    .addSubcommand(sub => sub.setName('owner').setDescription('Bu biletin sahibini göster'))
    .addSubcommand(sub => sub.setName('menu').setDescription('Bilet açma menüsünü göster'))
    .addSubcommand(sub => sub.setName('lock').setDescription('Mevcut bileti kilitle'))
    .addSubcommand(sub => sub.setName('unlock').setDescription('Mevcut biletin kilidini aç'))
    .addSubcommand(sub => sub.setName('set-channel').setDescription('Varsayılan bilet kanalını ayarla').addChannelOption(opt => opt.setName('channel').setDescription('Bilet kanalı').addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand(sub => sub.setName('reset-channel').setDescription('Varsayılan bilet kanalını sıfırla'))
    .addSubcommand(sub => sub.setName('set-category').setDescription('Bilet kanalları için kategori ayarla').addChannelOption(opt => opt.setName('category').setDescription('Kategori').addChannelTypes(ChannelType.GuildCategory).setRequired(true)))
    .addSubcommand(sub => sub.setName('reset-category').setDescription('Bilet kategorisini sıfırla'))
    .addSubcommand(sub => sub.setName('delete').setDescription('Mevcut bilet kanalını sil'))
    .addSubcommand(sub => sub.setName('move').setDescription('Bileti başka bir kategoriye taşı').addChannelOption(opt => opt.setName('category').setDescription('Hedef kategori').addChannelTypes(ChannelType.GuildCategory).setRequired(true)))
    .addSubcommand(sub => sub.setName('assign-owner').setDescription('Bilete yeni sahip ata').addUserOption(opt => opt.setName('user').setDescription('Sahip yapılacak kullanıcı').setRequired(true)))
    .addSubcommand(sub => sub.setName('info').setDescription('Mevcut bilet hakkında bilgi göster'))
    .addSubcommand(sub => sub.setName('settings').setDescription('Bilet sistemi ayarlarını göster'))
    .addSubcommand(sub => sub.setName('clear-log').setDescription('Bilet log kanalını temizle'))
    .addSubcommand(sub =>
      sub.setName('setup')
        .setDescription('Bilet sistemi ayarlarını yapılandır')
        .addChannelOption(option =>
          option.setName('category')
            .setDescription('Bilet kanalları için kategori')
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('support_role')
            .setDescription('Destek rolü')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('admin_role')
            .setDescription('Bilet yönetimi için admin rolü')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('dm_template')
            .setDescription('Bilet kapanınca DM şablonu')
            .setRequired(false))
        .addChannelOption(option =>
          option.setName('log_channel')
            .setDescription('Bilet log/transkript kanalı')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const config = loadConfig();

    // --- Kurulum (admin rolü zorunlu) ---
    if (sub === 'setup') {
      const category = interaction.options.getChannel('category');
      const supportRole = interaction.options.getRole('support_role');
      const adminRole = interaction.options.getRole('admin_role');
      const dmTemplate = interaction.options.getString('dm_template');
      const logChannel = interaction.options.getChannel('log_channel');
      config.ticketCategoryId = category.id;
      config.supportRoleId = supportRole.id;
      config.adminRoleId = adminRole.id;
      if (dmTemplate) config.dmTemplate = dmTemplate;
      if (logChannel) config.logChannelId = logChannel.id;
      saveConfig(config);
      await interaction.reply({ content: '✅ Bilet sistemi kurulumu tamamlandı! Artık bilet yönetimi için admin rolü gereklidir.' });
      return;
    }

    // --- Tüm diğer komutlar için admin veya sahip kontrolü ---
    const member = interaction.member;
    const isAdmin = isOwner(interaction.user) || hasAdminRole(member, config);

    // --- BİLET AÇ ---
    if (sub === 'open') {
      if (!config.ticketCategoryId || !config.supportRoleId) {
        await interaction.reply({ content: '❌ Bilet sistemi yapılandırılmamış. Lütfen bir yetkili `/ticket setup` komutunu kullansın.' });
        return;
      }
      const existing = interaction.guild.channels.cache.find(
        ch =>
          ch.parentId === config.ticketCategoryId &&
          ch.topic &&
          ch.topic.includes(`Ticket Owner: ${interaction.user.id}`)
      );
      if (existing) {
        await interaction.reply({ content: `❗ Zaten açık bir biletin var: <#${existing.id}>`, ephemeral: true });
        return;
      }
      const channelName = sanitizeChannelName(`bilet-${interaction.user.username}`);
      const category = interaction.guild.channels.cache.get(config.ticketCategoryId);
      if (!category || category.type !== ChannelType.GuildCategory) {
        await interaction.reply({ content: '❌ Bilet kategorisi geçersiz. Lütfen bir yetkili `/ticket settings` ile kontrol etsin.', ephemeral: true });
        return;
      }
      let ticketChannel;
      try {
        ticketChannel = await interaction.guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: category.id,
          topic: `Ticket Owner: ${interaction.user.id} | Açılış: ${new Date().toISOString()}`,
          permissionOverwrites: [
            {
              id: interaction.guild.roles.everyone.id,
              deny: ['ViewChannel'],
            },
            {
              id: interaction.user.id,
              allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
            },
            {
              id: config.supportRoleId,
              allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
            },
          ],
        });
      } catch (err) {
        await interaction.reply({ content: `❌ Bilet kanalı oluşturulamadı: ${err.message}`, ephemeral: true });
        return;
      }
      await interaction.reply({ content: `✅ Biletin oluşturuldu: <#${ticketChannel.id}>`, ephemeral: true });
      await sendTicketWelcomeEphemeral(interaction, ticketChannel, interaction.user.id, config.supportRoleId);
      return;
    }

    // --- Diğer tüm komutlar için admin/sahip zorunlu ---
    if (!isAdmin) {
      await interaction.reply({ content: '❌ Bu komutu kullanmak için admin rolüne veya bot sahibi olmaya ihtiyacın var.', ephemeral: true });
      return;
    }

    // --- BİLET MENÜSÜ (sadece admin/sahip, herkese açık) ---
    if (sub === 'menu') {
      await sendTicketMenu(interaction);
      return;
    }

    // --- BİLETİ KAPAT ---
    if (sub === 'close') {
      const channel = interaction.channel;
      if (!channel.topic || !channel.topic.includes('Ticket Owner:')) {
        await interaction.reply({ content: '❌ Bu kanal bir bilet olarak tanımlanmadı.' });
        return;
      }
      await channel.send('🔒 Bu bilet kapatıldı. Destek aldığınız için teşekkürler!');
      setTimeout(() => {
        channel.delete().catch(() => {});
      }, 5000);
      await interaction.reply({ content: '✅ Bilet 5 saniye içinde kapatılıp silinecek.' });
      return;
    }

    // --- DESTEK ROLÜ AYARLA ---
    if (sub === 'set-role') {
      const role = interaction.options.getRole('role');
      config.supportRoleId = role.id;
      saveConfig(config);
      await interaction.reply({ content: `✅ Destek rolü güncellendi! Yeni biletlerde <@&${role.id}> etiketlenecek.` });
      return;
    }

    // --- LOG KANALI AYARLA ---
    if (sub === 'set-log') {
      const channel = interaction.options.getChannel('channel');
      config.logChannelId = channel.id;
      saveConfig(config);
      await interaction.reply({ content: `📋 Bilet logları artık <#${channel.id}> kanalına gönderilecek.` });
      return;
    }

    // --- SSS ---
    if (sub === 'faq') {
      await interaction.reply({ content: '❓ **Bilet SSS:**\n- `/ticket open` ile bilet açabilirsin.\n- Yetkililer en kısa sürede yardımcı olacak.\n- Sorunun çözülünce `/ticket close` ile bileti kapatabilirsin.' });
      return;
    }

    // --- SAHİP ---
    if (sub === 'owner') {
      const ownerId = getTicketOwnerFromTopic(interaction.channel.topic);
      if (ownerId) {
        await interaction.reply({ content: `👤 Bu biletin sahibi: <@${ownerId}>.` });
      } else {
        await interaction.reply({ content: '❌ Bilet sahibi tespit edilemedi.' });
      }
      return;
    }

    // --- KİLİTLE ---
    if (sub === 'lock') {
      const channel = interaction.channel;
      if (!channel.topic || !channel.topic.includes('Ticket Owner:')) {
        await interaction.reply({ content: '❌ Bu kanal bir bilet olarak tanımlanmadı.' });
        return;
      }
      const ownerId = getTicketOwnerFromTopic(channel.topic);
      await channel.permissionOverwrites.edit(ownerId, { SendMessages: false });
      await interaction.reply({ content: '🔒 Bu bilet kilitlendi. Sadece yetkililer mesaj gönderebilir.' });
      return;
    }

    // --- KİLİDİ AÇ ---
    if (sub === 'unlock') {
      const channel = interaction.channel;
      if (!channel.topic || !channel.topic.includes('Ticket Owner:')) {
        await interaction.reply({ content: '❌ Bu kanal bir bilet olarak tanımlanmadı.' });
        return;
      }
      const ownerId = getTicketOwnerFromTopic(channel.topic);
      await channel.permissionOverwrites.edit(ownerId, { SendMessages: true });
      await interaction.reply({ content: '🔓 Bu biletin kilidi açıldı. Sohbete devam edebilirsiniz.' });
      return;
    }

    // --- VARSAYILAN BİLET KANALI AYARLA ---
    if (sub === 'set-channel') {
      const channel = interaction.options.getChannel('channel');
      config.ticketChannelId = channel.id;
      saveConfig(config);
      await interaction.reply({ content: `✅ Varsayılan bilet kanalı <#${channel.id}> olarak ayarlandı.` });
      return;
    }

    // --- VARSAYILAN BİLET KANALI SIFIRLA ---
    if (sub === 'reset-channel') {
      delete config.ticketChannelId;
      saveConfig(config);
      await interaction.reply({ content: '♻️ Varsayılan bilet kanalı sıfırlandı.' });
      return;
    }

    // --- KATEGORİ AYARLA ---
    if (sub === 'set-category') {
      const category = interaction.options.getChannel('category');
      config.ticketCategoryId = category.id;
      saveConfig(config);
      await interaction.reply({ content: `✅ Bilet kategorisi <#${category.id}> olarak ayarlandı.` });
      return;
    }

    // --- KATEGORİ SIFIRLA ---
    if (sub === 'reset-category') {
      delete config.ticketCategoryId;
      saveConfig(config);
      await interaction.reply({ content: '♻️ Bilet kategorisi sıfırlandı.' });
      return;
    }

    // --- BİLET KANALINI SİL ---
    if (sub === 'delete') {
      const channel = interaction.channel;
      if (!channel.topic || !channel.topic.includes('Ticket Owner:')) {
        await interaction.reply({ content: '❌ Bu kanal bir bilet olarak tanımlanmadı.' });
        return;
      }
      await interaction.reply({ content: '🗑️ Bu bilet kanalı 5 saniye içinde silinecek. Destek aldığınız için teşekkürler!' });
      setTimeout(() => {
        channel.delete().catch(() => {});
      }, 5000);
      return;
    }

    // --- BAŞKA KATEGORİYE TAŞI ---
    if (sub === 'move') {
      const category = interaction.options.getChannel('category');
      const channel = interaction.channel;
      if (!channel.topic || !channel.topic.includes('Ticket Owner:')) {
        await interaction.reply({ content: '❌ Bu kanal bir bilet olarak tanımlanmadı.' });
        return;
      }
      await channel.setParent(category.id);
      await interaction.reply({ content: `🚚 Bu bilet <#${category.id}> kategorisine taşındı.` });
      return;
    }

    // --- SAHİP ATA ---
    if (sub === 'assign-owner') {
      const user = interaction.options.getUser('user');
      const channel = interaction.channel;
      if (!channel.topic || !channel.topic.includes('Ticket Owner:')) {
        await interaction.reply({ content: '❌ Bu kanal bir bilet olarak tanımlanmadı.' });
        return;
      }
      const newTopic = channel.topic.replace(/Ticket Owner: \d+/, `Ticket Owner: ${user.id}`);
      await channel.setTopic(newTopic);
      await channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
      await interaction.reply({ content: `👤 Biletin sahibi artık ${user}.` });
      return;
    }

    // --- BİLGİ ---
    if (sub === 'info') {
      const channel = interaction.channel;
      if (!channel.topic || !channel.topic.includes('Ticket Owner:')) {
        await interaction.reply({ content: '❌ Bu kanal bir bilet olarak tanımlanmadı.' });
        return;
      }
      const ownerId = getTicketOwnerFromTopic(channel.topic);
      await interaction.reply({
        content: [
          'ℹ️ **Bilet Bilgisi:**',
          `• **Kanal:** <#${channel.id}>`,
          ownerId ? `• **Sahip:** <@${ownerId}>` : '',
          `• **Durum:** Açık`,
          `• **Oluşturulma:** ${channel.createdAt.toLocaleString('tr-TR')}`
        ].filter(Boolean).join('\n')
      });
      return;
    }

    // --- AYARLAR ---
    if (sub === 'settings') {
      await interaction.reply({
        content: [
          '⚙️ **Bilet Sistemi Ayarları:**',
          config.ticketCategoryId ? `• **Kategori:** <#${config.ticketCategoryId}>` : '',
          config.supportRoleId ? `• **Destek Rolü:** <@&${config.supportRoleId}>` : '',
          config.adminRoleId ? `• **Admin Rolü:** <@&${config.adminRoleId}>` : '',
          config.logChannelId ? `• **Log Kanalı:** <#${config.logChannelId}>` : '',
          config.dmTemplate ? `• **DM Şablonu:** \`${config.dmTemplate}\`` : ''
        ].filter(Boolean).join('\n')
      });
      return;
    }

    // --- LOG TEMİZLE (şimdilik stub) ---
    if (sub === 'clear-log') {
      await interaction.reply({ content: '🧹 Bilet log kanalı temizlendi! (Özellik yakında)' });
      return;
    }

    // --- FALLBACK ---
    await interaction.reply({ content: `🎉 /ticket ${sub} çalıştı!` });
  },

  handleTicketHelpMenu,
  handleTicketCloseButton,
};
