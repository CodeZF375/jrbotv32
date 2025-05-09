
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const OWNER_ID = process.env.OWNER_ID || '791741859423584286';

// Banner görseli URL'si (isteğe bağlı)
const BANNER_URL = 'https://cdn.discordapp.com/attachments/112233445566778899/123456789012345678/help_banner.png';

const SECTIONS = [
  {
    id: 'general_help',
    label: 'Genel',
    emoji: '📖',
    color: 0x5865f2,
    title: 'Genel Komutlar',
    description: 'Tüm kullanıcılar için temel komutlar.',
    fields: [
      { name: '/help', value: 'Bu yardım menüsünü gösterir.' },
      { name: '/ping', value: 'Pong ve gecikme süresini gösterir.' },
      { name: '/stats', value: 'Bot istatistiklerini gösterir.' },
      { name: '/bot-info', value: 'Bot hakkında bilgi verir.' },
      { name: '/uptime', value: 'Botun ne kadar süredir açık olduğunu gösterir.' },
      { name: '/invite', value: 'Botu sunucunuza eklemek için davet bağlantısı alırsınız.' },
      { name: '/support', value: 'Destek sunucusu bağlantısını alırsınız.' },
      { name: '/server-info', value: 'Mevcut sunucu hakkında bilgi gösterir.' },
      { name: '/user-info', value: 'Bir kullanıcı hakkında bilgi gösterir.' },
      { name: '/avatar @kullanıcı', value: 'Bir kullanıcının avatarını gösterir.' },
      { name: '/server-avatar', value: 'Sunucunun simgesini gösterir.' },
      { name: '/banner', value: 'Sunucu veya kullanıcı bannerını gösterir.' },
      { name: '/poll [soru]', value: 'Bir soru ile anket oluşturur.' },
      { name: '/translate [metin]', value: 'Metni başka bir dile çevirir.' },
      { name: '/weather [şehir]', value: 'Bir şehir için hava durumunu gösterir.' },
      { name: '/time', value: 'Şu anki saati gösterir.' },
      { name: '/add-note', value: 'Kişisel not ekler.' },
      { name: '/my-notes', value: 'Notlarınızı görüntüler.' },
      { name: '/delete-note', value: 'Bir notunuzu siler.' },
      { name: '/reminder', value: 'Hatırlatıcı ayarlar.' },
      { name: '/daily-message', value: 'Günlük mesajınızı alırsınız.' },
      { name: '/create-profile', value: 'Kullanıcı profilinizi oluşturur.' },
      { name: '/update-profile', value: 'Kullanıcı profilinizi günceller.' },
      { name: '/delete-profile', value: 'Kullanıcı profilinizi siler.' },
      { name: '/commands', value: 'Mevcut tüm komutları listeler.' },
      { name: '/bot-version', value: 'Botun mevcut sürümünü gösterir.' },
      { name: '/developer', value: 'Geliştirici hakkında bilgi gösterir.' },
      { name: '/links', value: 'Faydalı bağlantıları gösterir.' },
      { name: '/suggest', value: 'Bir özellik veya iyileştirme önerin.' },
      { name: '/task-help', value: 'Görevlerle ilgili yardım alırsınız.' },
    ],
  },
  {
    id: 'moderation_help',
    label: 'Moderasyon',
    emoji: '🛡️',
    color: 0xed4245,
    title: 'Moderasyon Komutları',
    description: 'Sunucunuzu güvenli ve düzenli tutun.',
    fields: [
      { name: '/kick', value: 'Bir kullanıcıyı sunucudan atar.' },
      { name: '/ban', value: 'Bir kullanıcıyı kalıcı olarak yasaklar.' },
      { name: '/unban', value: 'Birinin yasağını kaldırır (kullanıcı adı veya ID ile).' },
      { name: '/mute', value: 'Bir kullanıcıyı susturur (geçici veya kalıcı).' },
      { name: '/unmute', value: 'Bir kullanıcının susturmasını kaldırır.' },
      { name: '/warn', value: 'Bir kullanıcıya uyarı verir.' },
      { name: '/warnings', value: 'Bir kullanıcının uyarılarını görüntüler.' },
      { name: '/clearwarns', value: 'Bir kullanıcının tüm uyarılarını temizler.' },
      { name: '/purge', value: 'Bir kanaldaki son mesajları toplu olarak siler.' },
      { name: '/slowmode', value: 'Bir kanalda yavaş mod ayarlar veya kaldırır.' },
      { name: '/lock', value: 'Bir kanalı normal kullanıcılar için kilitler.' },
      { name: '/unlock', value: 'Kilitli bir kanalı açar.' },
      { name: '/tempban', value: 'Bir kullanıcıyı belirli bir süreliğine yasaklar.' },
      { name: '/tempmute', value: 'Bir kullanıcıyı belirli bir süreliğine susturur.' },
      { name: '/timeout', value: 'Discord\'un yerleşik zaman aşımı özelliğini kullanır.' },
    ],
  },
  {
    id: 'admin_help',
    label: 'Admin',
    emoji: '⚙️',
    color: 0x9b59b6,
    title: 'Admin Komutları',
    description: 'Sunucu yönetimi ve yapılandırma komutları.',
    fields: [
      { name: '/set-autorole', value: 'Yeni üyelere otomatik olarak atanacak rolü ayarlar.' },
      { name: '/reset-autorole', value: 'Otorol ayarını sıfırlar.' },
      { name: '/set-log-channel', value: 'Sunucu olayları için log kanalını ayarlar.' },
      { name: '/reset-log-channel', value: 'Log kanalı ayarını sıfırlar.' },
      { name: '/set-prefix', value: 'Bu sunucu için özel prefix ayarlar.' },
      { name: '/reset-prefix', value: 'Prefixi varsayılana sıfırlar.' },
      { name: '/enable-curse-filter', value: 'Küfür filtresini etkinleştirir.' },
      { name: '/disable-curse-filter', value: 'Küfür filtresini devre dışı bırakır.' },
      { name: '/enable-ad-filter', value: 'Reklam filtresini etkinleştirir.' },
      { name: '/disable-ad-filter', value: 'Reklam filtresini devre dışı bırakır.' },
      { name: '/enable-maintenance', value: 'Bakım modunu etkinleştirir (bot çoğu komutu yok sayar).' },
      { name: '/disable-maintenance', value: 'Bakım modunu devre dışı bırakır.' },
      { name: '/add-role', value: 'Bir kullanıcıya rol ekler.' },
      { name: '/remove-role', value: 'Bir kullanıcıdan rol kaldırır.' },
      { name: '/lock-channel', value: 'Mevcut kanalı @everyone için kilitler.' },
      { name: '/unlock-channel', value: 'Mevcut kanalı @everyone için açar.' },
      { name: '/add-emoji', value: 'Sunucuya özel emoji ekler.' },
      { name: '/delete-emoji', value: 'Sunucudan özel emoji siler.' },
      { name: '/make-announcement', value: 'Belirtilen kanalda duyuru yapar.' },
      { name: '/server-info', value: 'Sunucu hakkında bilgi gösterir.' },
      { name: '/clear-channel', value: 'Bu kanaldaki mesajları toplu siler.' },
      { name: '/set-auto-nickname', value: 'Yeni üyelere otomatik olarak atanacak takma adı ayarlar.' },
      { name: '/reset-auto-nickname', value: 'Otomatik takma ad ayarını sıfırlar.' },
      { name: '/set-counter', value: 'Üye sayısını gösterecek kanalı ayarlar.' },
      { name: '/reset-counter', value: 'Üye sayacı kanalını sıfırlar.' },
      { name: '/set-modlog', value: 'Modlog kanalını ayarlar.' },
      { name: '/reset-modlog', value: 'Modlog kanalı ayarını sıfırlar.' },
      { name: '/create-role', value: 'Yeni bir rol oluşturur.' },
      { name: '/delete-role', value: 'Sunucudan bir rol siler.' },
      { name: '/create-category', value: 'Yeni bir kategori kanalı oluşturur.' }
    ],
  },
  {
    id: 'utility_help',
    label: 'Yardımcı',
    emoji: '🛠️',
    color: 0x57f287,
    title: 'Yardımcı & Kayıt',
    description: 'Kullanışlı araçlar ve kayıt özellikleri.',
    fields: [
      { name: '/modlog', value: 'Son moderasyon işlemlerini gösterir.' },
      { name: '/report', value: 'Kullanıcıların modlara şikayet göndermesini sağlar.' },
      { name: '/note', value: 'Bir kullanıcıya dahili not ekler (sadece modlar görebilir).' },
      { name: '/userinfo', value: 'Kullanıcının katılma tarihi, rolleri, uyarıları vb. gösterir.' },
    ],
  },
  {
    id: 'ticket_help',
    label: 'Destek Sistemi',
    emoji: '🎫',
    color: 0x3498db,
    title: 'Destek Sistemi Komutları',
    description: 'Destek taleplerini açın, yönetin ve yapılandırın.',
    fields: [
      { name: '/ticket open', value: 'Yeni bir destek talebi açar.' },
      { name: '/ticket close', value: 'Mevcut destek talebini kapatır.' },
      { name: '/ticket set-role', value: 'Destek talepleri için destek rolünü ayarlar.' },
      { name: '/ticket set-log', value: 'Destek talepleri için log kanalını ayarlar.' },
      { name: '/ticket faq', value: 'Destek sistemi SSS/yardımını gösterir.' },
      { name: '/ticket owner', value: 'Bu talebin sahibini gösterir.' },
      { name: '/ticket menu', value: 'Destek sistemi açılır menüsünü gösterir.' },
      { name: '/ticket lock', value: 'Mevcut destek talebini kilitler.' },
      { name: '/ticket unlock', value: 'Kilitli destek talebini açar.' },
      { name: '/ticket set-channel', value: 'Varsayılan destek talebi kanalını ayarlar.' },
      { name: '/ticket reset-channel', value: 'Varsayılan destek talebi kanalını sıfırlar.' },
      { name: '/ticket set-category', value: 'Destek talepleri için kategori ayarlar.' },
      { name: '/ticket reset-category', value: 'Destek talebi kategorisini sıfırlar.' },
      { name: '/ticket delete', value: 'Mevcut destek talebi kanalını siler.' },
      { name: '/ticket move', value: 'Destek talebini başka bir kategoriye taşır.' },
      { name: '/ticket assign-owner', value: 'Destek talebine yeni bir sahip atar.' },
      { name: '/ticket info', value: 'Mevcut destek talebi hakkında bilgi gösterir.' },
      { name: '/ticket settings', value: 'Destek sistemi mevcut ayarlarını gösterir.' },
      { name: '/ticket clear-log', value: 'Destek log kanalını temizler.' },
      { name: '/ticket setup', value: 'Destek sistemi ayarlarını yapılandırır.' },
    ],
  },
  {
    id: 'music_help',
    label: 'Müzik',
    emoji: '🎵',
    color: 0x1db954,
    title: 'Müzik Komutları',
    description: 'Arkadaşlarınla müzik keyfi yaşa.',
    fields: [
      { name: '/autoleave', value: 'Ses kanalında kimse kalmadığında otomatik olarak ayrılır.' },
      { name: '/autopause', value: 'Dinleyici kalmadığında çalmayı otomatik olarak duraklatır.' },
      { name: '/autoqueue', value: 'Kuyruk boşaldığında önerilen veya ilgili parçaları otomatik ekler.' },
      { name: '/loop', value: 'Mevcut parçayı veya tüm kuyruğu döngüye alır.' },
      { name: '/move', value: 'Botu başka bir ses kanalına taşır.' },
      { name: '/play', value: 'Bir şarkıyı URL veya arama ile çalar.' },
      { name: '/stop', value: 'Çalmayı durdurur ve kuyruğu temizler.' },
      { name: '/leave', value: 'Botu ses kanalından çıkarır.' },
      { name: '/join', value: 'Belirtilen ses kanalına katılır.' },
    ],
  },
  {
    id: 'economy_help',
    label: 'Ekonomi',
    emoji: '💰',
    color: 0x00bfff,
    title: 'Ekonomi Komutları',
    description: 'Sanal paranı kazan, harca ve yönet.',
    fields: [
      { name: '/balance', value: 'Cüzdan ve banka bakiyeni gösterir.' },
      { name: '/daily', value: 'Günlük ödülünü alırsın.' },
      { name: '/work', value: '“Çalışarak” rastgele para kazanırsın.' },
      { name: '/beg', value: 'Şansını dene, para dilen.' },
      { name: '/deposit [miktar]', value: 'Paranı bankaya yatır.' },
      { name: '/withdraw [miktar]', value: 'Bankadan para çek.' },
      { name: '/store', value: 'Mağazadaki tüm ürünleri görüntüle.' },
      { name: '/additem [isim] [fiyat]', value: 'Mağazaya ürün ekle (sadece sahibi).' },
      { name: '/removeitem [isim]', value: 'Mağazadan ürün sil (sadece sahibi).' },
      { name: '/buy [ürün]', value: 'Mağazadan ürün satın al.' },
      { name: '/sell [ürün]', value: 'Envanterindeki ürünü sat.' },
      { name: '/inventory', value: 'Sahip olduğun ürünleri gör.' },
      { name: '/inv', value: '/inventory için kısayol.' },
      { name: '/use [ürün]', value: 'Özel bir ürünü kullan (ör. kutu veya güçlendirici).' },
      { name: '/gamble [miktar]', value: 'Yazı tura ile paranı riske at.' },
      { name: '/slots [miktar]', value: 'Slot makinesi oyunu.' },
      { name: '/rob [kullanıcı]', value: 'Başka bir kullanıcıyı soymaya çalış (bekleme süresi ve risk ile).' },
      { name: '/crime', value: 'Suç işle, ödül veya hapis riski.' },
      { name: '/leaderboard', value: 'En zengin kullanıcıları gösterir.' },
      { name: '/networth', value: 'Toplam para + envanter değeri.' },
      { name: '/stats', value: 'Ekonomik ilerlemeni gösterir.' },
      { name: '/invest [miktar]', value: 'Hisse veya kripto yatırımı simülasyonu.' },
      { name: '/pay [kullanıcı] [miktar]', value: 'Başka bir kullanıcıya para gönder.' },
      { name: '/loan [miktar]', value: 'Borç al (faizli).' },
      { name: '/heist', value: 'Grup soygunu etkinliği.' },
      { name: '/trade [kullanıcı]', value: 'Başka bir kullanıcıyla eşya takası yap.' },
    ],
  },
  {
    id: 'fun_help_1',
    label: 'Eğlence (1)',
    emoji: '🎲',
    color: 0xfee75c,
    title: 'Eğlence Komutları (Sayfa 1)',
    description: 'Sunucuyu eğlenceli hale getirin! (Sayfa 1)',
    fields: [
      { name: '/joke', value: 'Rastgele bir şaka söyler.' },
      { name: '/caps', value: 'Mesajınızı büyük harfe çevirir.' },
      { name: '/slap @kullanıcı', value: 'Bir kullanıcıya tokat at!' },
      { name: '/hug @kullanıcı', value: 'Birine sarıl!' },
      { name: '/coinflip', value: 'Yazı tura atar.' },
      { name: '/roll-dice', value: 'Zar atar.' },
      { name: '/dog-picture', value: 'Rastgele köpek resmi gönderir.' },
      { name: '/cat-picture', value: 'Rastgele kedi resmi gönderir.' },
      { name: '/tell-joke', value: 'Bir şaka anlatır.' },
      { name: '/gif-search [anahtar]', value: 'GIF araması yapar.' },
      { name: '/fbi', value: 'FBI open up!' },
      { name: '/love-meter @kullanıcı', value: 'Biriyle aşk uyumunu ölçer.' },
      { name: '/jail @kullanıcı', value: 'Bir kullanıcıyı hapse atar!' },
      { name: '/how-old-am-i', value: 'Yaşını tahmin eder.' },
      { name: '/buy-tea', value: 'Bir bardak çay alırsın.' },
      { name: '/compliment-me', value: 'Sana iltifat eder.' },
      { name: '/make-me-laugh', value: 'Seni güldürür.' },
      { name: '/drunk', value: 'Sarhoş gibi davranır.' },
      { name: '/guess-number', value: 'Sayı tahmin oyunu oynar.' },
      { name: '/meme', value: 'Rastgele meme gönderir.' },
      { name: '/scare-me', value: 'Korkutucu bir şey gönderir.' },
      { name: '/fun-fact', value: 'Eğlenceli bir bilgi verir.' },
      { name: '/anime-suggestion', value: 'İzlemen için anime önerir.' },
      { name: '/generate-password', value: 'Rastgele şifre oluşturur.' },
      { name: '/steam-game [isim]', value: 'Bir Steam oyunu hakkında bilgi verir.' }
    ],
  },
  {
    id: 'fun_help_2',
    label: 'Eğlence (2)',
    emoji: '🎲',
    color: 0xfee75c,
    title: 'Eğlence Komutları (Sayfa 2)',
    description: 'Sunucuyu eğlenceli hale getirin! (Sayfa 2)',
    fields: [
      { name: '/trivia', value: 'Bilgi yarışması sorusu cevapla.' },
      { name: '/give-tip', value: 'Rastgele bir ipucu al.' },
      { name: '/random-emoji', value: 'Rastgele emoji gönderir.' },
      { name: '/random-song', value: 'Rastgele şarkı önerisi al.' },
      { name: '/spotify-recommend', value: 'Spotify şarkı önerisi al.' }
    ],
  },
];

// Yardımcı: Diziyi n boyutlu parçalara böler
function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

function buildDropdown(disabled = false) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('help_dropdown')
      .setPlaceholder('📚 Bir yardım kategorisi seçin...')
      .setDisabled(disabled)
      .addOptions(
        SECTIONS.map(section => ({
          label: section.label,
          value: section.id,
          emoji: section.emoji,
          description: section.description,
        }))
      )
  );
}

// Alanlar 25'ten fazlaysa birden fazla embed döndürür
function buildSectionEmbed(section, user) {
  const fieldChunks = chunkArray(section.fields, 25);
  return fieldChunks.map((fieldsChunk, idx) => {
    const embed = new EmbedBuilder()
      .setColor(section.color)
      .setTitle(`${section.emoji} ${section.title}`)
      .setDescription(section.description)
      .addFields(fieldsChunk)
      .setFooter({
        text: `${user.username} tarafından istendi`,
        iconURL: user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    if (BANNER_URL) embed.setImage(BANNER_URL);
    if (fieldChunks.length > 1) embed.setTitle(`${section.emoji} ${section.title} (Sayfa ${idx + 1})`);
    return embed;
  });
}

function buildMainEmbed(user) {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('✨ Yardım Menüsü')
    .setDescription(
      [
        '**Yardım Menüsüne** hoş geldiniz! Farklı komut kategorilerini keşfetmek için aşağıdaki açılır menüyü kullanın.',
        '',
        SECTIONS.map(s => `${s.emoji} **${s.label}** — ${s.description}`).join('\n'),
        '',
        '> Daha fazla yardıma mı ihtiyacınız var? [Destek Sunucumuza](https://discord.gg/yourserver) katılın veya `/report` komutunu kullanın!'
      ].join('\n')
    )
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: `${user.username} tarafından istendi`,
      iconURL: user.displayAvatarURL({ dynamic: true }),
    })
    .setTimestamp();

  if (BANNER_URL) embed.setImage(BANNER_URL);
  return embed;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Kullanılabilir komutların listesini interaktif şekilde gösterir'),
  async execute(interaction) {
    await interaction.reply({
      embeds: [buildMainEmbed(interaction.user)],
      components: [buildDropdown()],
      ephemeral: false,
    });
  },

  /**
   * Yardım menüsü için açılır menü etkileşimlerini işler.
   * Sadece /help komutunu kullanan kullanıcıya yanıt verir (gizlilik).
   */
  async handleComponent(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== 'help_dropdown') return;

    // Sadece ilgili kullanıcıya göster
    if (
      interaction.message.interaction &&
      interaction.user.id !== interaction.message.interaction.user.id
    ) {
      return interaction.reply({
        content: "Bu yardım menüsünü kullanamazsınız. Lütfen `/help` komutunu kendiniz kullanın!",
        ephemeral: false,
      });
    }

    const sectionId = interaction.values[0];
    const section = SECTIONS.find(s => s.id === sectionId);
    if (!section) {
      return interaction.reply({ content: 'Bilinmeyen yardım kategorisi.', ephemeral: false });
    }
    const embeds = buildSectionEmbed(section, interaction.user);

    await interaction.update({
      embeds: embeds,
      components: [buildDropdown()],
    });
  },
};
