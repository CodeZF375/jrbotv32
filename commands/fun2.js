const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fetch = require('node-fetch');
const OWNER_ID = process.env.OWNER_ID || '791741859423584286';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fun2')
    .setDescription('Eğlence komutları! (Sayfa 2)')
    .addSubcommand(sub => sub.setName('slap').setDescription('Bir kullanıcıya tokat at!').addUserOption(opt => opt.setName('user').setDescription('Tokat atılacak kullanıcı').setRequired(true)))
    .addSubcommand(sub => sub.setName('spotify-recommend').setDescription('Spotify şarkı önerisi al.'))
    .addSubcommand(sub => sub.setName('steam-game').setDescription('Bir Steam oyunu hakkında bilgi al.').addStringOption(opt => opt.setName('name').setDescription('Oyun adı').setRequired(true)))
    .addSubcommand(sub => sub.setName('tell-joke').setDescription('Bir şaka yapar.'))
    .addSubcommand(sub => sub.setName('trivia').setDescription('Bilgi yarışması sorusu cevapla.')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'slap') {
      const user = interaction.options.getUser('user');
      const slaps = [
        `👋 ${user}'ya efsane bir tokat attın!`,
        `😱 ${user} başka bir boyuta tokatlandı!`,
        `🤚 ${user}, bu acıtmış olmalı!`,
        `💥 ${user} büyük bir balıkla tokatlandı!`,
        `🖐️ ${user}, resmen tokatlandın!`
      ];
      await interaction.reply({ content: slaps[Math.floor(Math.random() * slaps.length)] });
    } else if (sub === 'spotify-recommend') {
      const tracks = [
        "🎵 Spotify'da 'Levitating' - Dua Lipa'yı dinlemeyi dene!",
        "🎶 'Sunflower' - Post Malone & Swae Lee nasıl?",
        "🎧 The Weeknd'den 'Blinding Lights' mutlaka dinlenmeli!",
        "🎼 'Dance Monkey' - Tones and I çok akılda kalıcı!",
        "🎤 Dua Lipa'dan 'Don't Start Now' tam bir hit!"
      ];
      await interaction.reply({ content: tracks[Math.floor(Math.random() * tracks.length)] });
    } else if (sub === 'steam-game') {
      const name = interaction.options.getString('name');
      await interaction.reply({ content: `🎮 **${name}** için Steam araması: https://store.steampowered.com/search/?term=${encodeURIComponent(name)}` });
    } else if (sub === 'tell-joke') {
      // Gerçek bir şaka çekmeye çalış, olmazsa statik şakaya düş
      try {
        const res = await fetch('https://v2.jokeapi.dev/joke/Any?type=single');
        const data = await res.json();
        if (data && data.joke) {
          await interaction.reply({ content: `😂 ${data.joke}` });
          return;
        }
      } catch {}
      // Yedek şakalar
      const jokes = [
        "Domates neden kızardı? Çünkü salata sosunu gördü! 🥗",
        "Bisiklet neden devrildi? Çünkü iki tekeri vardı! 🚲",
        "Pterodaktil tuvalete gittiğinde neden duyamazsın? Çünkü 'P' harfi sessiz! 🦖",
        "Golfçü neden iki pantolon getirdi? Çünkü birinde delik olabilir! ⛳",
        "Bilgisayar neden işe geç kaldı? Çünkü hard diski vardı! 💻"
      ];
      await interaction.reply({ content: jokes[Math.floor(Math.random() * jokes.length)] });
    } else if (sub === 'trivia') {
      // Butonlu bilgi yarışması
      const questions = [
        {
          q: "Fransa'nın başkenti neresidir?",
          options: ["Paris", "Londra", "Berlin", "Madrid"],
          answer: 0
        },
        {
          q: "'Olmak ya da olmamak' sözünü kim yazdı?",
          options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
          answer: 1
        },
        {
          q: "Güneş sistemimizdeki en büyük gezegen hangisidir?",
          options: ["Dünya", "Jüpiter", "Satürn", "Mars"],
          answer: 1
        },
        {
          q: "Titanic hangi yıl battı?",
          options: ["1912", "1920", "1905", "1898"],
          answer: 0
        },
        {
          q: "Altının kimyasal sembolü nedir?",
          options: ["Ag", "Au", "Gd", "Go"],
          answer: 1
        }
      ];
      const pick = questions[Math.floor(Math.random() * questions.length)];
      const row = new ActionRowBuilder().addComponents(
        pick.options.map((opt, idx) =>
          new ButtonBuilder()
            .setCustomId(`trivia_${idx}`)
            .setLabel(opt)
            .setStyle(ButtonStyle.Primary)
        )
      );
      const reply = await interaction.reply({
        content: `❓ Bilgi Yarışması: ${pick.q}`,
        components: [row],
        fetchReply: true
      });
      const collector = reply.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        max: 1,
        time: 15000
      });
      collector.on('collect', async i => {
        const idx = parseInt(i.customId.split('_')[1]);
        if (idx === pick.answer) {
          await i.update({ content: `✅ Doğru! Cevap: **${pick.options[pick.answer]}**.`, components: [] });
        } else {
          await i.update({ content: `❌ Yanlış! Doğru cevap: **${pick.options[pick.answer]}**.`, components: [] });
        }
      });
      collector.on('end', async collected => {
        if (collected.size === 0) {
          await reply.edit({ content: `⏰ Süre doldu! Doğru cevap: **${pick.options[pick.answer]}**.`, components: [] }).catch(() => {});
        }
      });
    } else {
      await interaction.reply({ content: `🎉 /fun2 ${sub} çalıştı!` });
    }
  },
};
