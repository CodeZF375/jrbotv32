const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const OWNER_ID = process.env.OWNER_ID || '791741859423584286';

const builder = new SlashCommandBuilder()
  .setName('general2')
  .setDescription('Genel amaçlı komutlar (2. bölüm).')
  .addSubcommand(sub =>
    sub.setName('bot-version')
      .setDescription('Botun mevcut sürümünü gösterir.')
  )
  .addSubcommand(sub =>
    sub.setName('developer')
      .setDescription('Geliştirici hakkında bilgi gösterir.')
  )
  .addSubcommand(sub =>
    sub.setName('links')
      .setDescription('Faydalı bağlantıları gösterir.')
  )
  .addSubcommand(sub =>
    sub.setName('suggest')
      .setDescription('Bir özellik veya iyileştirme öner.')
      .addStringOption(opt =>
        opt.setName('suggestion')
          .setDescription('Öneriniz')
          .setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub.setName('task-help')
      .setDescription('Bir konuda yardım al.')
      .addStringOption(opt =>
        opt.setName('task')
          .setDescription('Yardım istediğiniz görevi açıklayın')
          .setRequired(false)
      )
  );

// Sürüm bilgisini güvenli şekilde al
let version = '1.0.0';
try {
  const pkg = require(path.join(process.cwd(), 'package.json'));
  version = pkg.version || version;
} catch (e) {
  // varsayılan sürüm
}

const handlers = {
  'bot-version': async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle('Bot Sürümü')
      .setDescription(`Mevcut sürümüm: **v${version}**`)
      .setColor(0x00FFB3);
    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
  developer: async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle('Geliştirici Bilgisi')
      .setDescription('Bu bot **YourName#1234** tarafından geliştirilmiştir.\n[GitHub](https://github.com/yourusername)')
      .setColor(0x00FFB3);
    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
  links: async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle('Faydalı Bağlantılar')
      .setDescription(
        [
          '[Beni Davet Et](https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands)',
          '[Destek Sunucusu](https://discord.gg/your-support-server)',
          '[GitHub](https://github.com/yourusername)'
        ].join('\n')
      )
      .setColor(0x00FFB3);
    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
  suggest: async (interaction) => {
    const suggestion = interaction.options.getString('suggestion');
    const embed = new EmbedBuilder()
      .setTitle('Öneri Alındı')
      .setDescription(`Öneriniz için teşekkürler!\n\n> ${suggestion}`)
      .setColor(0x00FFB3);
    await interaction.reply({ embeds: [embed], ephemeral: false });
    // İsteğe bağlı: önerileri bir kanala gönderebilirsiniz
    // const suggestionsChannel = interaction.guild.channels.cache.find(c => c.name === 'suggestions');
    // if (suggestionsChannel) suggestionsChannel.send({ embeds: [embed] });
  },
  'task-help': async (interaction) => {
    const task = interaction.options.getString('task');
    const embed = new EmbedBuilder()
      .setTitle('Görev Yardımı')
      .setDescription(
        task
          ? `Şu konuda yardım istediniz:\n> ${task}\n\nBir moderatör veya bot size yakında yardımcı olacak!`
          : 'Size nasıl yardımcı olabilirim? Lütfen bir dahaki sefere açıklama girin!'
      )
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
