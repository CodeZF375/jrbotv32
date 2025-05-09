const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const ECONOMY_PATH = path.join(__dirname, '../../data/economy.json');
const INVENTORY_PATH = path.join(__dirname, '../../data/inventory.json');
const LOANS_PATH = path.join(__dirname, '../../data/loans.json');
const INVESTMENTS_PATH = path.join(__dirname, '../../data/investments.json');
const OWNER_ID = process.env.OWNER_ID || '791741859423584286';

// Utility functions for persistent storage
function readJSON(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Economy functions
function getUserEconomy(userId) {
  const db = readJSON(ECONOMY_PATH, {});
  if (!db[userId]) db[userId] = { wallet: 0, bank: 0, lastDaily: 0 };
  return db[userId];
}
function setUserEconomy(userId, data) {
  const db = readJSON(ECONOMY_PATH, {});
  db[userId] = data;
  writeJSON(ECONOMY_PATH, db);
}
function getUserInventory(userId) {
  const db = readJSON(INVENTORY_PATH, {});
  if (!db[userId]) db[userId] = [];
  return db[userId];
}
function setUserInventory(userId, items) {
  const db = readJSON(INVENTORY_PATH, {});
  db[userId] = items;
  writeJSON(INVENTORY_PATH, db);
}
function getUserLoans(userId) {
  const db = readJSON(LOANS_PATH, {});
  if (!db[userId]) db[userId] = [];
  return db[userId];
}
function setUserLoans(userId, loans) {
  const db = readJSON(LOANS_PATH, {});
  db[userId] = loans;
  writeJSON(LOANS_PATH, db);
}
function getUserInvestments(userId) {
  const db = readJSON(INVESTMENTS_PATH, {});
  if (!db[userId]) db[userId] = [];
  return db[userId];
}
function setUserInvestments(userId, investments) {
  const db = readJSON(INVESTMENTS_PATH, {});
  db[userId] = investments;
  writeJSON(INVESTMENTS_PATH, db);
}
function formatCurrency(amount) {
  return `₺${amount.toLocaleString('tr-TR')}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('economy2')
    .setDescription('Ekonomi komutları: para kazan, harca ve yönet. (Sayfa 2)')
    .addSubcommand(sub => sub.setName('stats').setDescription('Ekonomik ilerlemeni göster.'))
    .addSubcommand(sub => sub.setName('invest').setDescription('Hisse/kripto yatırımı simüle et.').addIntegerOption(opt => opt.setName('amount').setDescription('Yatırılacak miktar').setRequired(true)))
    .addSubcommand(sub => sub.setName('pay').setDescription('Bir kullanıcıya para gönder.').addUserOption(opt => opt.setName('user').setDescription('Para gönderilecek kullanıcı').setRequired(true)).addIntegerOption(opt => opt.setName('amount').setDescription('Gönderilecek miktar').setRequired(true)))
    .addSubcommand(sub => sub.setName('loan').setDescription('Faizli borç al veya borçlarını görüntüle.').addIntegerOption(opt => opt.setName('amount').setDescription('Alınacak borç miktarı').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('payloan')
        .setDescription('Borçlarını öde.')
        .addIntegerOption(opt => opt.setName('amount').setDescription('Ödenecek miktar (isteğe bağlı)').setRequired(false))
        .addBooleanOption(opt => opt.setName('all').setDescription('Tüm borçları öde').setRequired(false))
    )
    .addSubcommand(sub => sub.setName('heist').setDescription('Grup soygunu etkinliği.'))
    .addSubcommand(sub => sub.setName('trade').setDescription('Bir kullanıcıyla eşya takası yap.').addUserOption(opt => opt.setName('user').setDescription('Takas yapılacak kullanıcı').setRequired(true)))
    .addSubcommand(sub => sub.setName('addmoney').setDescription('Bir kullanıcıya para ekle (sadece sahip)').addUserOption(opt => opt.setName('user').setDescription('Para eklenecek kullanıcı').setRequired(true)).addIntegerOption(opt => opt.setName('amount').setDescription('Eklenecek miktar').setRequired(true)))
    .addSubcommand(sub => sub.setName('removemoney').setDescription('Bir kullanıcıdan para sil (sadece sahip)').addUserOption(opt => opt.setName('user').setDescription('Para silinecek kullanıcı').setRequired(true)).addIntegerOption(opt => opt.setName('amount').setDescription('Silinecek miktar').setRequired(true))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    // --- İstatistikler ---
    if (sub === 'stats') {
      const econ = getUserEconomy(userId);
      const inv = getUserInventory(userId);
      const loans = getUserLoans(userId);
      const investments = getUserInvestments(userId);
      const embed = new EmbedBuilder()
        .setTitle(`${interaction.user.username} Ekonomi İstatistikleri`)
        .setColor(0x00bfff)
        .addFields(
          { name: 'Cüzdan', value: formatCurrency(econ.wallet), inline: true },
          { name: 'Banka', value: formatCurrency(econ.bank), inline: true },
          { name: 'Envanter', value: `${inv.length} eşya`, inline: true },
          { name: 'Borçlar', value: loans.length > 0 ? loans.filter(l => !l.paid).map(l => formatCurrency(l.total - (l.paidAmount || 0))).join(', ') : 'Yok', inline: true },
          { name: 'Yatırımlar', value: investments.length > 0 ? investments.map(i => formatCurrency(i.amount)).join(', ') : 'Yok', inline: true }
        );
      await interaction.reply({ embeds: [embed] });
    }
    // --- Yatırım ---
    else if (sub === 'invest') {
      const amount = interaction.options.getInteger('amount');
      if (amount <= 0) {
        await interaction.reply({ content: '❌ Miktar pozitif olmalı.' });
        return;
      }
      const econ = getUserEconomy(userId);
      if (econ.wallet < amount) {
        await interaction.reply({ content: '❌ Yatırım yapmak için yeterli paran yok.' });
        return;
      }
      econ.wallet -= amount;
      setUserEconomy(userId, econ);

      // Sonucu kısa bir gecikmeden sonra simüle et
      await interaction.reply({ content: `⏳ ${formatCurrency(amount)} yatırılıyor... Lütfen bekle.` });
      setTimeout(() => {
        const win = Math.random() < 0.5;
        let result = '';
        if (win) {
          const profit = Math.floor(amount * (Math.random() * 0.5 + 0.5)); // %50-%100 kar
          econ.wallet += amount + profit;
          setUserEconomy(userId, econ);
          // Yatırım kaydını ekle
          const investments = getUserInvestments(userId);
          investments.push({ amount, profit, date: new Date().toISOString() });
          setUserInvestments(userId, investments);
          result = `📈 Yatırımın karlı çıktı! ${formatCurrency(profit)} kazandın ve ${formatCurrency(amount)} ana paranı geri aldın.`;
        } else {
          // Yatırım kaydını ekle
          const investments = getUserInvestments(userId);
          investments.push({ amount, profit: -amount, date: new Date().toISOString() });
          setUserInvestments(userId, investments);
          result = `📉 Yatırımın değer kaybetti. ${formatCurrency(amount)} kaybettin.`;
        }
        interaction.editReply({ content: result });
      }, 2000);
    }
    // --- Para Gönder ---
    else if (sub === 'pay') {
      const target = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');
      if (target.id === userId) {
        await interaction.reply({ content: '❌ Kendine para gönderemezsin.' });
        return;
      }
      if (amount <= 0) {
        await interaction.reply({ content: '❌ Miktar pozitif olmalı.' });
        return;
      }
      const econ = getUserEconomy(userId);
      if (econ.wallet < amount) {
        await interaction.reply({ content: '❌ Para göndermek için yeterli paran yok.' });
        return;
      }
      econ.wallet -= amount;
      setUserEconomy(userId, econ);
      const targetEcon = getUserEconomy(target.id);
      targetEcon.wallet += amount;
      setUserEconomy(target.id, targetEcon);
      await interaction.reply({ content: `💸 ${target} kullanıcısına ${formatCurrency(amount)} gönderdin.` });
    }
    // --- Borç (görüntüle veya al) ---
    else if (sub === 'loan') {
      const amount = interaction.options.getInteger('amount');
      if (!amount) {
        // Borçları görüntüle
        const loans = getUserLoans(userId).filter(l => !l.paid);
        if (loans.length === 0) {
          await interaction.reply({ content: '✅ Hiç borcun yok!' });
          return;
        }
        const embed = new EmbedBuilder()
          .setTitle(`${interaction.user.username} Borçları`)
          .setColor(0xf1c40f)
          .setDescription(
            loans.map((l, i) =>
              `**#${i + 1}:** Alınan: ${formatCurrency(l.amount)}, Faiz: ${formatCurrency(l.interest)}, Toplam: ${formatCurrency(l.total)}, Ödenen: ${formatCurrency(l.paidAmount || 0)}, Kalan: ${formatCurrency(l.total - (l.paidAmount || 0))}`
            ).join('\n')
          );
        await interaction.reply({ embeds: [embed] });
        return;
      }
      // Yeni borç al
      if (amount <= 0) {
        await interaction.reply({ content: '❌ Miktar pozitif olmalı.' });
        return;
      }
      // %10 faiz
      const interest = Math.ceil(amount * 0.1);
      const total = amount + interest;
      const econ = getUserEconomy(userId);
      econ.wallet += amount;
      setUserEconomy(userId, econ);
      // Borç kaydını ekle
      const loans = getUserLoans(userId);
      loans.push({ amount, interest, total, borrowedAt: new Date().toISOString(), paid: false, paidAmount: 0 });
      setUserLoans(userId, loans);
      await interaction.reply({ content: `🏦 ${formatCurrency(amount)} borç aldın. Toplam geri ödemen gereken: ${formatCurrency(total)} (%10 faiz). /payloan ile ödeyebilirsin.` });
    }
    // --- Borç Öde ---
    else if (sub === 'payloan') {
      let payAmount = interaction.options.getInteger('amount');
      const payAll = interaction.options.getBoolean('all');
      const econ = getUserEconomy(userId);
      let loans = getUserLoans(userId).filter(l => !l.paid);
      if (loans.length === 0) {
        await interaction.reply({ content: '✅ Hiç borcun yok!' });
        return;
      }
      if (payAll) {
        // Toplam kalan borcu hesapla
        const totalRemaining = loans.reduce((sum, l) => sum + (l.total - (l.paidAmount || 0)), 0);
        if (econ.wallet < totalRemaining) {
          await interaction.reply({ content: `❌ Tüm borçlarını ödemek için yeterli paran yok (${formatCurrency(totalRemaining)} gerekli).` });
          return;
        }
        for (let loan of loans) {
          loan.paidAmount = loan.total;
          loan.paid = true;
        }
        econ.wallet -= totalRemaining;
        setUserEconomy(userId, econ);
        // Güncellenmiş borçları kaydet
        let allLoans = getUserLoans(userId);
        for (let l of loans) {
          let idx = allLoans.findIndex(x => x.borrowedAt === l.borrowedAt);
          if (idx !== -1) allLoans[idx] = l;
        }
        setUserLoans(userId, allLoans);
        await interaction.reply({ content: `✅ Tüm borçlarını ödedin! (${formatCurrency(totalRemaining)})` });
        return;
      }
      // Miktar belirtilmediyse, ilk borcu tamamen öde
      if (!payAmount) {
        payAmount = loans[0].total - (loans[0].paidAmount || 0);
      }
      if (payAmount <= 0) {
        await interaction.reply({ content: '❌ Miktar pozitif olmalı.' });
        return;
      }
      if (econ.wallet < payAmount) {
        await interaction.reply({ content: `❌ Borçlarını ödemek için yeterli paran yok (${formatCurrency(payAmount)} gerekli).` });
        return;
      }
      let remaining = payAmount;
      let paidTotal = 0;
      let updated = false;
      for (let loan of loans) {
        const left = loan.total - (loan.paidAmount || 0);
        if (left <= 0) continue;
        const toPay = Math.min(left, remaining);
        loan.paidAmount = (loan.paidAmount || 0) + toPay;
        paidTotal += toPay;
        remaining -= toPay;
        if (loan.paidAmount >= loan.total) {
          loan.paid = true;
        }
        updated = true;
        if (remaining <= 0) break;
      }
      if (!updated) {
        await interaction.reply({ content: '❌ Ödenecek borç bulunamadı.' });
        return;
      }
      econ.wallet -= paidTotal;
      setUserEconomy(userId, econ);
      // Güncellenmiş borçları kaydet
      let allLoans = getUserLoans(userId);
      for (let l of loans) {
        let idx = allLoans.findIndex(x => x.borrowedAt === l.borrowedAt);
        if (idx !== -1) allLoans[idx] = l;
      }
      setUserLoans(userId, allLoans);
      await interaction.reply({ content: `✅ Borçlarına ${formatCurrency(paidTotal)} ödedin.` });
    }
    // --- Soygun ---
    else if (sub === 'heist') {
      // Grup soygunu etkinliği (rastgele sonuç)
      const outcomes = [
        { msg: "💣 Ekibin başarılı bir soygun yaptı ve ₺2.000 paylaştınız!", reward: 2000 },
        { msg: "🚨 Polis ekibini yakaladı! ₺500 kaybettin.", reward: -500 },
        { msg: "😎 Soygun başarısız oldu ama kaçmayı başardın.", reward: 0 }
      ];
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      const econ = getUserEconomy(userId);
      econ.wallet += outcome.reward;
      setUserEconomy(userId, econ);
      await interaction.reply({ content: outcome.msg });
    }
    // --- Takas ---
    else if (sub === 'trade') {
      const target = interaction.options.getUser('user');
      if (target.id === userId) {
        await interaction.reply({ content: '❌ Kendinle takas yapamazsın.' });
        return;
      }
      // Basitçe takas başlat (gerçek takas sistemi için daha fazla mantık gerekir)
      await interaction.reply({ content: `🔄 ${target} ile takas başlattın. (Takas sistemi yakında!)` });
    }
    // --- Para Ekle (sadece sahip) ---
    else if (sub === 'addmoney') {
      if (interaction.user.id !== OWNER_ID) {
        await interaction.reply({ content: '❌ Bu komutu sadece bot sahibi kullanabilir.', ephemeral: false });
        return;
      }
      const target = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');
      if (amount <= 0) {
        await interaction.reply({ content: '❌ Miktar pozitif olmalı.' });
        return;
      }
      const econ = getUserEconomy(target.id);
      econ.wallet += amount;
      setUserEconomy(target.id, econ);
      await interaction.reply({ content: `💸 ${target} kullanıcısının cüzdanına ${formatCurrency(amount)} eklendi.` });
    }
    // --- Para Sil (sadece sahip) ---
    else if (sub === 'removemoney') {
      if (interaction.user.id !== OWNER_ID) {
        await interaction.reply({ content: '❌ Bu komutu sadece bot sahibi kullanabilir.', ephemeral: false });
        return;
      }
      const target = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');
      if (amount <= 0) {
        await interaction.reply({ content: '❌ Miktar pozitif olmalı.' });
        return;
      }
      const econ = getUserEconomy(target.id);
      econ.wallet = Math.max(0, econ.wallet - amount);
      setUserEconomy(target.id, econ);
      await interaction.reply({ content: `💸 ${target} kullanıcısının cüzdanından ${formatCurrency(amount)} silindi.` });
    }
    // --- Fallback ---
    else {
      await interaction.reply({ content: `🎉 /economy2 ${sub} çalıştı!` });
    }
  },
};
