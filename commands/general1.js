const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const OWNER_ID = process.env.OWNER_ID || '791741859423584286';

const builder = new SlashCommandBuilder()
  .setName('general1')
  .setDescription('Genel amaçlı komutlar (1. bölüm).')
  .addSubcommand(sub =>
    sub.setName('help')
      .setDescription('Tüm komutların ve açıklamalarının listesini gösterir.')
  )
  .addSubcommand(sub =>
    sub.setName('ping')
      .setDescription('Pong ve detaylı gecikme istatistikleriyle yanıtlar!')
  )
  .addSubcommand(sub =>
    sub.setName('stats')
      .setDescription('Bot istatistiklerini gösterir.')
  )
  .addSubcommand(sub =>
    sub.setName('bot-info')
      .setDescription('Bot hakkında bilgi gösterir.')
  )
  .addSubcommand(sub =>
    sub.setName('uptime')
      .setDescription('Botun ne kadar süredir çevrimiçi olduğunu gösterir.')
  )
  .addSubcommand(sub =>
    sub.setName('invite')
      .setDescription('Botu sunucunuza eklemek için davet linki alırsınız.')
  )
  .addSubcommand(sub =>
    sub.setName('support')
      .setDescription('Destek sunucusu linki alırsınız.')
  )
  .addSubcommand(sub =>
    sub.setName('server-info')
      .setDescription('Mevcut sunucu hakkında bilgi gösterir.')
  )
  .addSubcommand(sub =>
    sub.setName('user-info')
      .setDescription('Bir kullanıcı hakkında bilgi gösterir.')
      .addUserOption(opt =>
        opt.setName('user')
          .setDescription('Bilgisi alınacak kullanıcı')
          .setRequired(false)
      )
  )
  .addSubcommand(sub =>
    sub.setName('avatar')
      .setDescription('Bir kullanıcının profil fotoğrafını gösterir.')
      .addUserOption(opt =>
        opt.setName('user')
          .setDescription('Profil fotoğrafı gösterilecek kullanıcı')
          .setRequired(false)
      )
  )
  .addSubcommand(sub =>
    sub.setName('server-avatar')
      .setDescription('Sunucunun simgesini gösterir.')
  )
  .addSubcommand(sub =>
    sub.setName('banner')
      .setDescription('Sunucu veya kullanıcı bannerını gösterir.')
      .addUserOption(opt =>
        opt.setName('user')
          .setDescription('Bannerı gösterilecek kullanıcı (isteğe bağlı)')
          .setRequired(false)
      )
  )
  .addSubcommand(sub =>
    sub.setName('poll')
      .setDescription('Bir soru ile anket oluşturur.')
      .addStringOption(opt =>
        opt.setName('question')
          .setDescription('Anket sorusu')
          .setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub.setName('translate')
      .setDescription('Metni başka bir dile çevirir.')
      .addStringOption(opt =>
        opt.setName('text')
          .setDescription('Çevrilecek metin')
          .setRequired(true)
      )
      .addStringOption(opt =>
        opt.setName('to')
          .setDescription('Hedef dil (örn. en, fr, es)')
          .setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub.setName('weather')
      .setDescription('Bir şehir için hava durumunu alır.')
      .addStringOption(opt =>
        opt.setName('city')
          .setDescription('Şehir adı')
          .setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub.setName('time')
      .setDescription('Şu anki zamanı gösterir.')
  )
  .addSubcommand(sub =>
    sub.setName('add-note')
      .setDescription('Kişisel not ekle.')
      .addStringOption(opt =>
        opt.setName('note')
          .setDescription('Eklenecek not')
          .setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub.setName('my-notes')
      .setDescription('Notlarını görüntüle.')
  )
  .addSubcommand(sub =>
    sub.setName('delete-note')
      .setDescription('Bir notunu sil.')
      .addIntegerOption(opt =>
        opt.setName('id')
          .setDescription('Silinecek notun ID\'si')
          .setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub.setName('reminder')
      .setDescription('Hatırlatıcı ayarla.')
      .addStringOption(opt =>
        opt.setName('reminder')
          .setDescription('Ne hatırlatılacak?')
          .setRequired(true)
      )
      .addStringOption(opt =>
        opt.setName('time')
          .setDescription('Ne zaman hatırlatılsın? (örn. 10d, 1s)')
          .setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub.setName('daily-message')
      .setDescription('Günlük mesajını al.')
  )
  .addSubcommand(sub =>
    sub.setName('create-profile')
      .setDescription('Kullanıcı profilini oluştur.')
  )
  .addSubcommand(sub =>
    sub.setName('update-profile')
      .setDescription('Kullanıcı profilini güncelle.')
  )
  .addSubcommand(sub =>
    sub.setName('delete-profile')
      .setDescription('Kullanıcı profilini sil.')
  )
  .addSubcommand(sub =>
    sub.setName('commands')
      .setDescription('Mevcut tüm komutları listeler.')
  );

const handlers = {
  help: async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle('Yardım Menüsü')
      .setDescription('Etileşimli yardım menüsü için `/help`, komut listesi için `/general1 commands` kullanabilirsin.')
      .setColor(0x5865f2);
    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
  ping: async (interaction) => {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);
    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setDescription(`Bot Gecikmesi: **${latency}ms**\nAPI Gecikmesi: **${apiLatency}ms**`)
      .setColor(0x00FFB3);
    await interaction.editReply({ content: null, embeds: [embed] });
  },
  stats: async (interaction) => {
    const { client } = interaction;
    let totalSubcommands = 0;
    client.commands.forEach(cmd => {
      const data = typeof cmd.data.toJSON === 'function' ? cmd.data.toJSON() : cmd.data;
      if (data.options) {
        data.options.forEach(opt => {
          if (opt.type === 1) {
            totalSubcommands += 1;
          } else if (opt.type === 2 && opt.options) {
            totalSubcommands += opt.options.filter(o => o.type === 1).length;
          }
        });
      }
    });

    const embed = new EmbedBuilder()
      .setTitle('Bot İstatistikleri')
      .addFields(
        { name: 'Sunucu', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Kullanıcı', value: `${client.users.cache.size}`, inline: true },
        { name: 'Kanal', value: `${client.channels.cache.size}`, inline: true },
        { name: 'Çalışma Süresi', value: `<t:${Math.floor(client.readyTimestamp / 1000)}:R>`, inline: true },
        { name: 'Toplam Komut', value: `${totalSubcommands}`, inline: true }
      )
      .setColor(0x00FFB3);

    await interaction.reply({ embeds: [embed] });
  },
  'bot-info': async (interaction) => {
  const { client } = interaction;
  const os = require('os');
  const packageJson = require(require('path').join(process.cwd(), 'package.json'));
  const owner = await client.users.fetch(process.env.OWNER_ID || '791741859423584286').catch(() => null);

  // Memory usage
  const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
  // Uptime
  const totalSeconds = Math.floor(client.uptime / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const seconds = totalSeconds % 60;
  // Library versions
  const djsVersion = packageJson.dependencies['discord.js'] || packageJson.devDependencies['discord.js'] || 'Bilinmiyor';
  const nodeVersion = process.version;

  const embed = new EmbedBuilder()
    .setTitle('🤖 Bot Bilgisi')
    .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
    .setColor(0x5865F2)
    .setDescription('discord.js ile geliştirilmiş çok amaçlı bir Discord botu.\n\n**Bot Sahibi:** ' + (owner ? `<@${owner.id}>` : 'Bilinmiyor'))
    .addFields(
      { name: '👤 Bot İsmi', value: client.user.tag, inline: true },
      { name: '🆔 Bot ID', value: client.user.id, inline: true },
      { name: '📅 Oluşturulma', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:F>`, inline: true },
      { name: '💻 Node.js Sürümü', value: nodeVersion, inline: true },
      { name: '📦 discord.js Sürümü', value: djsVersion.replace('^', ''), inline: true },
      { name: '🖥️ Sunucu', value: `${client.guilds.cache.size}`, inline: true },
      { name: '👥 Kullanıcı', value: `${client.users.cache.size}`, inline: true },
      { name: '💬 Kanal', value: `${client.channels.cache.size}`, inline: true },
      { name: '⏱️ Çalışma Süresi', value: `${days}g ${hours}s ${minutes}d ${seconds}s`, inline: true },
      { name: '🧠 Bellek Kullanımı', value: `${memoryUsage.toFixed(2)} MB`, inline: true }
    )
    .setFooter({ text: `Geliştirici: ${owner ? owner.tag : 'Bilinmiyor'}` });

  await interaction.reply({ embeds: [embed] });
},
  uptime: async (interaction) => {
    const { client } = interaction;
    const totalSeconds = Math.floor(client.uptime / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = totalSeconds % 60;
    const embed = new EmbedBuilder()
      .setTitle('Çalışma Süresi')
      .setDescription(`Bot **${days}g ${hours}s ${minutes}d ${seconds}s** süredir çevrimiçi.`)
      .setColor(0x00FFB3);
    await interaction.reply({ embeds: [embed] });
  },
  invite: async (interaction) => {
    const clientId = interaction.client.user.id;
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;
    const embed = new EmbedBuilder()
      .setTitle('Beni Davet Et')
      .setDescription(`[Beni sunucuna eklemek için buraya tıkla!](${inviteUrl})`)
      .setColor(0x00FFB3);
    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
  support: async (interaction) => {
    const supportUrl = 'https://discord.gg/your-support-server'; // Gerçek destek sunucunuzu ekleyin
    const embed = new EmbedBuilder()
      .setTitle('Destek Sunucusu')
      .setDescription(`[Destek sunucumuza katılmak için buraya tıkla!](${supportUrl})`)
      .setColor(0x00FFB3);
    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
  'server-info': async (interaction) => {
    const guild = interaction.guild;
    const embed = new EmbedBuilder()
      .setTitle('Sunucu Bilgisi')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: 'Sunucu Adı', value: guild.name, inline: true },
        { name: 'Sunucu ID', value: guild.id, inline: true },
        { name: 'Sahip', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Üye Sayısı', value: `${guild.memberCount}`, inline: true },
        { name: 'Oluşturulma', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true }
      )
      .setColor(0x00FFB3);
    await interaction.reply({ embeds: [embed] });
  },
  'user-info': async (interaction) => {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    const embed = new EmbedBuilder()
      .setTitle('Kullanıcı Bilgisi')
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Kullanıcı Adı', value: user.tag, inline: true },
        { name: 'Kullanıcı ID', value: user.id, inline: true },
        { name: 'Sunucuya Katılım', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : 'Yok', inline: true },
        { name: 'Hesap Oluşturulma', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true }
      )
      .setColor(0x00FFB3);
    await interaction.reply({ embeds: [embed] });
  },
  avatar: async (interaction) => {
    const user = interaction.options.getUser('user') || interaction.user;
    const embed = new EmbedBuilder()
      .setTitle(`${user.tag} adlı kullanıcının avatarı`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 512 }))
      .setColor(0x00FFB3);
    await interaction.reply({ embeds: [embed] });
  },
  'server-avatar': async (interaction) => {
    const guild = interaction.guild;
    const embed = new EmbedBuilder()
      .setTitle(`${guild.name} Sunucu Simgesi`)
      .setImage(guild.iconURL({ dynamic: true, size: 512 }))
      .setColor(0x00FFB3);
    await interaction.reply({ embeds: [embed] });
  },
  banner: async (interaction) => {
    const user = interaction.options.getUser('user');
    if (user) {
      const fetchedUser = await interaction.client.users.fetch(user.id, { force: true });
      if (!fetchedUser.banner) {
        return interaction.reply({ content: 'Bu kullanıcının bannerı yok.', ephemeral: false });
      }
      const embed = new EmbedBuilder()
        .setTitle(`${fetchedUser.tag} adlı kullanıcının bannerı`)
        .setImage(fetchedUser.bannerURL({ size: 1024 }))
        .setColor(0x00FFB3);
      return interaction.reply({ embeds: [embed] });
    } else {
      const guild = interaction.guild;
      if (!guild.banner) {
        return interaction.reply({ content: 'Bu sunucunun bannerı yok.', ephemeral: false });
      }
      const embed = new EmbedBuilder()
        .setTitle(`${guild.name} Sunucu Bannerı`)
        .setImage(guild.bannerURL({ size: 1024 }))
        .setColor(0x00FFB3);
      return interaction.reply({ embeds: [embed] });
    }
  },
  poll: async (interaction) => {
    const question = interaction.options.getString('question');
    const embed = new EmbedBuilder()
      .setTitle('📊 Yeni Anket')
      .setDescription(question)
      .setColor(0x00FFB3)
      .setFooter({ text: `Anketi başlatan: ${interaction.user.tag}` });
    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    await msg.react('👍');
    await msg.react('👎');
  },
  translate: async (interaction) => {
    const text = interaction.options.getString('text');
    const to = interaction.options.getString('to');
    await interaction.reply({ content: `"${text}" metni ${to} diline çevrildi: (çeviri yakında)`, ephemeral: false });
  },
  weather: async (interaction) => {
    const city = interaction.options.getString('city');
    await interaction.reply({ content: `${city} için hava durumu: (hava durumu yakında)`, ephemeral: false });
  },
  time: async (interaction) => {
    const now = new Date();
    await interaction.reply({ content: `Sunucu saati: ${now.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}` });
  },
  'add-note': async (interaction) => {
    const note = interaction.options.getString('note');
    await interaction.reply({ content: `Notun eklendi: "${note}"`, ephemeral: false });
  },
  'my-notes': async (interaction) => {
    await interaction.reply({ content: 'Notların: (özellik yakında)', ephemeral: false });
  },
  'delete-note': async (interaction) => {
    const id = interaction.options.getInteger('id');
    await interaction.reply({ content: `ID'si ${id} olan notun silindi. (özellik yakında)`, ephemeral: false });
  },
  reminder: async (interaction) => {
    const reminder = interaction.options.getString('reminder');
    const time = interaction.options.getString('time');
    await interaction.reply({ content: `"${reminder}" için ${time} sonra hatırlatıcı ayarlandı. (özellik yakında)`, ephemeral: false });
  },
  'daily-message': async (interaction) => {
    await interaction.reply({ content: 'Günün mesajı: (özellik yakında)', ephemeral: false });
  },
  'create-profile': async (interaction) => {
    await interaction.reply({ content: 'Profilin oluşturuldu! (özellik yakında)', ephemeral: false });
  },
  'update-profile': async (interaction) => {
    await interaction.reply({ content: 'Profilin güncellendi! (özellik yakında)', ephemeral: false });
  },
  'delete-profile': async (interaction) => {
    await interaction.reply({ content: 'Profilin silindi! (özellik yakında)', ephemeral: false });
  },
  commands: async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle('Mevcut Komutlar')
      .setDescription(builder.options.map(opt => `\`/${builder.name} ${opt.name}\` - ${opt.description}`).join('\n'))
      .setColor(0x00FFB3);
    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
};

module.exports = {
  data: builder,
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (handlers[sub]) {
      await handlers[sub](interaction);
    } else {
      await interaction.reply({ content: 'Bu komut henüz uygulanmadı.', ephemeral: false });
    }
  },
};
