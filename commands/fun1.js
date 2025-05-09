const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
const OWNER_ID = process.env.OWNER_ID || '791741859423584286';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fun1')
    .setDescription('Eğlence komutları! (Sayfa 1)')
    .addSubcommand(sub => sub.setName('anime-suggestion').setDescription('İzlemen için bir anime önerir.'))
    .addSubcommand(sub => sub.setName('buy-tea').setDescription('Bir fincan çay alırsın.'))
    .addSubcommand(sub => sub.setName('caps').setDescription('Mesajını büyük harfe çevirir.').addStringOption(opt => opt.setName('text').setDescription('Çevrilecek metin').setRequired(true)))
    .addSubcommand(sub => sub.setName('cat-picture').setDescription('Rastgele bir kedi fotoğrafı gönderir.'))
    .addSubcommand(sub => sub.setName('coinflip').setDescription('Yazı tura atar.'))
    .addSubcommand(sub => sub.setName('compliment-me').setDescription('Sana iltifat eder.'))
    .addSubcommand(sub => sub.setName('dog-picture').setDescription('Rastgele bir köpek fotoğrafı gönderir.'))
    .addSubcommand(sub => sub.setName('drunk').setDescription('Sarhoş gibi davranır.'))
    .addSubcommand(sub => sub.setName('fbi').setDescription('FBI baskını!'))
    .addSubcommand(sub => sub.setName('fun-fact').setDescription('Eğlenceli bir bilgi verir.'))
    .addSubcommand(sub => sub.setName('generate-password').setDescription('Rastgele bir şifre üretir.'))
    .addSubcommand(sub => sub.setName('gif-search').setDescription('GIF arar.').addStringOption(opt => opt.setName('keyword').setDescription('GIF anahtar kelimesi').setRequired(true)))
    .addSubcommand(sub => sub.setName('give-tip').setDescription('Rastgele bir ipucu verir.'))
    .addSubcommand(sub => sub.setName('guess-number').setDescription('Sayı tahmin oyunu oynar.'))
    .addSubcommand(sub => sub.setName('how-old-am-i').setDescription('Yaşını tahmin eder.'))
    .addSubcommand(sub => sub.setName('hug').setDescription('Birine sarılırsın!').addUserOption(opt => opt.setName('user').setDescription('Sarılınacak kullanıcı').setRequired(true)))
    .addSubcommand(sub => sub.setName('jail').setDescription('Bir kullanıcıyı hapse atar!').addUserOption(opt => opt.setName('user').setDescription('Hapse atılacak kullanıcı').setRequired(true)))
    .addSubcommand(sub => sub.setName('joke').setDescription('Rastgele bir şaka yapar.'))
    .addSubcommand(sub => sub.setName('love-meter').setDescription('Biriyle aşk uyumunu ölçer.').addUserOption(opt => opt.setName('user').setDescription('Uyum bakılacak kullanıcı').setRequired(true)))
    .addSubcommand(sub => sub.setName('make-me-laugh').setDescription('Seni güldürür.'))
    .addSubcommand(sub => sub.setName('meme').setDescription('Rastgele bir meme gönderir.'))
    .addSubcommand(sub => sub.setName('random-emoji').setDescription('Rastgele bir emoji gönderir.'))
    .addSubcommand(sub => sub.setName('random-song').setDescription('Rastgele bir şarkı önerir.'))
    .addSubcommand(sub => sub.setName('roll-dice').setDescription('Zar atar.'))
    .addSubcommand(sub => sub.setName('scare-me').setDescription('Korkutucu bir şey gönderir.')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'anime-suggestion') {
      const suggestions = [
        "Şunu izlemeyi dene: **Fullmetal Alchemist: Brotherhood**! 🔥",
        "**Attack on Titan**'a ne dersin? 🗡️",
        "Epik bir macera için **One Piece**'e göz at! 🏴‍☠️",
        "Gülmek mi istiyorsun? **KonoSuba** çok komik! 😂",
        "Klasiklerden: **Naruto**! 🍥"
      ];
      await interaction.reply({ content: suggestions[Math.floor(Math.random() * suggestions.length)] });
    } else if (sub === 'buy-tea') {
      await interaction.reply({ content: '🍵 Taze demlenmiş çayınız burada! Afiyet olsun!' });
    } else if (sub === 'caps') {
      const text = interaction.options.getString('text');
      await interaction.reply({ content: `🔊 ${text.toUpperCase()}` });
    } else if (sub === 'cat-picture') {
      try {
        await interaction.reply({ content: '🐱 İşte sana sevimli bir kedi fotoğrafı!', files: ['https://cataas.com/cat'] });
      } catch {
        await interaction.reply({ content: '🐱 İşte sana sevimli bir kedi fotoğrafı! https://cataas.com/cat' });
      }
    } else if (sub === 'coinflip') {
      const result = Math.random() < 0.5 ? 'Yazı' : 'Tura';
      await interaction.reply({ content: `🪙 Para **${result}** geldi!` });
    } else if (sub === 'compliment-me') {
      const compliments = [
        "Olduğun gibi harikasın! 🌟",
        "Ortamı aydınlatıyorsun! 💡",
        "Kodlama yıldızısın! 🚀",
        "Harika bir mizah anlayışın var! 😄",
        "Düşündüğünden daha zekisin! 🧠"
      ];
      await interaction.reply({ content: compliments[Math.floor(Math.random() * compliments.length)] });
    } else if (sub === 'dog-picture') {
      try {
        const res = await fetch('https://random.dog/woof.json');
        const data = await res.json();
        if (data.url && (data.url.endsWith('.jpg') || data.url.endsWith('.png') || data.url.endsWith('.jpeg') || data.url.endsWith('.gif'))) {
          await interaction.reply({ content: '🐶 İşte sana sevimli bir köpek fotoğrafı!', files: [data.url] });
        } else {
          await interaction.reply({ content: `🐶 İşte sana sevimli bir köpek fotoğrafı! ${data.url}` });
        }
      } catch {
        await interaction.reply({ content: '🐶 İşte sana sevimli bir köpek fotoğrafı! https://random.dog/woof.json' });
      }
    } else if (sub === 'drunk') {
      await interaction.reply({ content: "*hik* Ben sarhoş değilim, sadece biraz kod yazdım! 🍻" });
    } else if (sub === 'fbi') {
      await interaction.reply({ content: '🚨 **FBI AÇILIN!** 🚪👮‍♂️' });
    } else if (sub === 'fun-fact') {
      const facts = [
        "Biliyor muydun? Bal asla bozulmaz! 🍯",
        "Bir grup flamingoya 'flamboyance' denir. 🦩",
        "Muz aslında bir meyvedir, çilek ise değildir! 🍌🍓",
        "Ahtapotların üç kalbi vardır! 🐙",
        "Eyfel Kulesi sıcak günlerde 15 cm uzayabilir. 🗼"
      ];
      await interaction.reply({ content: facts[Math.floor(Math.random() * facts.length)] });
    } else if (sub === 'generate-password') {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
      let password = '';
      for (let i = 0; i < 12; i++) password += chars[Math.floor(Math.random() * chars.length)];
      await interaction.reply({ content: `🔐 Rastgele şifren: \`${password}\`` });
    } else if (sub === 'gif-search') {
      const keyword = interaction.options.getString('keyword');
      try {
        const res = await fetch(`https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(keyword)}&key=LIVDSRZULELA&limit=1`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          await interaction.reply({ content: `🔎 **${keyword}** için bir GIF: ${data.results[0].media_formats.gif.url}` });
        } else {
          await interaction.reply({ content: `❌ **${keyword}** için GIF bulunamadı.` });
        }
      } catch {
        await interaction.reply({ content: `🔎 **${keyword}** için GIF: https://giphy.com/search/${encodeURIComponent(keyword)}` });
      }
    } else if (sub === 'give-tip') {
      const tips = [
        "Kodlarken ara vermeyi unutma! 🧘",
        "Kodunu DRY tut (Kendini Tekrar Etme)! 💡",
        "Koduna yorum ekle, gelecekteki sen teşekkür edecek! 📝",
        "Pratik mükemmelleştirir. Devam et! 💪",
        "Debug yapmak kod yazmaktan iki kat daha zordur. 🐞"
      ];
      await interaction.reply({ content: tips[Math.floor(Math.random() * tips.length)] });
    } else if (sub === 'guess-number') {
      const number = Math.floor(Math.random() * 10) + 1;
      await interaction.reply({ content: `🔢 1 ile 10 arasında bir sayı tuttum... Cevap: **${number}**!` });
    } else if (sub === 'how-old-am-i') {
      const age = Math.floor(Math.random() * 80) + 1;
      await interaction.reply({ content: `🎂 Sen **${age}** yaşındasın! (Belki de ruhun gençtir!)` });
    } else if (sub === 'hug') {
      const user = interaction.options.getUser('user');
      await interaction.reply({ content: `🤗 ${user} kullanıcısına sımsıkı sarıldın!` });
    } else if (sub === 'jail') {
      const user = interaction.options.getUser('user');
      await interaction.reply({ content: `🚓 ${user} hapse atıldı! Bir dahaki sefere daha dikkatli ol!` });
    } else if (sub === 'joke') {
      const jokes = [
        "Programcılar neden koyu temayı sever? Çünkü ışık böcekleri çeker! 🐛",
        "Korkuluk neden ödül aldı? Çünkü tarlasında çok iyiydi! 🌾",
        "Bilim insanları neden atomlara güvenmez? Çünkü her şeyi onlar oluşturur! ⚛️",
        "Matematik kitabı neden üzgündü? Çünkü çok problemi vardı. 📚",
        "Bilgisayar neden doktora gitti? Çünkü virüsü vardı! 🦠"
      ];
      await interaction.reply({ content: jokes[Math.floor(Math.random() * jokes.length)] });
    } else if (sub === 'love-meter') {
      const user = interaction.options.getUser('user');
      const percent = Math.floor(Math.random() * 101);
      await interaction.reply({ content: `💖 ${user} ile aşk uyumunuz **%${percent}**!` });
    } else if (sub === 'make-me-laugh') {
      const laughs = [
        "Tavuk neden bir gruba katıldı? Çünkü bagetleri vardı! 🥁",
        "Paralel çizgilerin çok ortak noktası var. Ne yazık ki asla buluşamayacaklar. 😢",
        "Bilgisayarıma mola vermem gerektiğini söyledim, o da 'Sorun yok, uyku moduna geçiyorum.' dedi. 😴",
        "İskeletler neden kavga etmez? Çünkü cesaretleri yoktur. 💀",
        "Sana bir UDP şakası anlatırdım ama anlamayabilirsin. 😏"
      ];
      await interaction.reply({ content: laughs[Math.floor(Math.random() * laughs.length)] });
    } else if (sub === 'meme') {
      try {
        const res = await fetch('https://meme-api.com/gimme');
        const data = await res.json();
        if (data.url) {
          await interaction.reply({ content: `${data.title}\n${data.url}` });
        } else {
          await interaction.reply({ content: '😂 İşte sana bir meme: https://reddit.com/r/memes/random' });
        }
      } catch {
        await interaction.reply({ content: '😂 İşte sana bir meme: https://reddit.com/r/memes/random' });
      }
    } else if (sub === 'random-emoji') {
      const emojis = ['😂', '😎', '🤖', '🔥', '🎉', '🥳', '😜', '🤩', '😇', '👻', '🐱', '🐶', '🍕', '🍔', '🍟', '🍩', '🍉', '🍦', '🚀', '🌈'];
      await interaction.reply({ content: `Rastgele emojin: ${emojis[Math.floor(Math.random() * emojis.length)]}` });
    } else if (sub === 'random-song') {
      const songs = [
        "🎵 Queen'den 'Bohemian Rhapsody' dinlemeyi dene!",
        "🎶 The Weeknd'den 'Blinding Lights' nasıl?",
        "🎧 Ed Sheeran'dan 'Shape of You' bir hit!",
        "🎼 Billie Eilish'den 'Bad Guy' harika!",
        "🎤 Mark Ronson ft. Bruno Mars'dan 'Uptown Funk'!"
      ];
      await interaction.reply({ content: songs[Math.floor(Math.random() * songs.length)] });
    } else if (sub === 'roll-dice') {
      const roll = Math.floor(Math.random() * 6) + 1;
      await interaction.reply({ content: `🎲 Zar attın ve **${roll}** geldi!` });
    } else if (sub === 'scare-me') {
      const scares = [
        "👻 Buuu! Korktun mu?",
        "😱 Arkanda bir şey hareket etti...",
        "🕷️ Omzunda bir örümcek var! Şaka şaka.",
        "🔦 Çok karanlık... fazlasıyla karanlık...",
        "💀 Ayak sesleri duyuyorsun... ama yalnızsın."
      ];
      await interaction.reply({ content: scares[Math.floor(Math.random() * scares.length)] });
    } else {
      await interaction.reply({ content: `🎉 /fun1 ${sub} çalıştı!` });
    }
  },
};
