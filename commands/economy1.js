const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { getStoreItems, addStoreItem, removeStoreItem } = require('../utils/storeDb');

const ECONOMY_PATH = path.join(__dirname, '../../data/economy.json');
const INVENTORY_PATH = path.join(__dirname, '../../data/inventory.json');
const ITEMS_PER_PAGE = 10;
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

function formatCurrency(amount) {
  return `₺${amount.toLocaleString('tr-TR')}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('economy')
    .setDescription('Ekonomi komutları: para kazan, harca ve yönet. (Sayfa 1)')
    .addSubcommand(sub => sub.setName('balance').setDescription('Cüzdan ve banka bakiyeni gösterir.'))
    .addSubcommand(sub => sub.setName('daily').setDescription('Günlük ödülünü al.'))
    .addSubcommand(sub => sub.setName('work').setDescription('“Çalışarak” rastgele para kazan.'))
    .addSubcommand(sub => sub.setName('beg').setDescription('Şansını dilenerek dene.'))
    .addSubcommand(sub => sub.setName('deposit').setDescription('Bankaya para yatır.').addIntegerOption(opt => opt.setName('amount').setDescription('Yatırılacak miktar').setRequired(true)))
    .addSubcommand(sub => sub.setName('withdraw').setDescription('Bankadan para çek.').addIntegerOption(opt => opt.setName('amount').setDescription('Çekilecek miktar').setRequired(true)))
    .addSubcommand(sub => sub.setName('store').setDescription('Mağazadaki tüm ürünleri görüntüle.'))
    .addSubcommand(sub => sub.setName('additem').setDescription('Mağazaya ürün ekle (sadece sahip).').addStringOption(opt => opt.setName('name').setDescription('Ürün adı').setRequired(true)).addIntegerOption(opt => opt.setName('price').setDescription('Ürün fiyatı').setRequired(true)))
    .addSubcommand(sub => sub.setName('removeitem').setDescription('Mağazadan ürün sil (sadece sahip).').addStringOption(opt => opt.setName('name').setDescription('Ürün adı').setRequired(true)))
    .addSubcommand(sub => sub.setName('buy').setDescription('Mağazadan ürün satın al.').addStringOption(opt => opt.setName('item').setDescription('Ürün adı').setRequired(true)))
    .addSubcommand(sub => sub.setName('sell').setDescription('Envanterindeki ürünü sat.').addStringOption(opt => opt.setName('item').setDescription('Ürün adı').setRequired(true)))
    .addSubcommand(sub => sub.setName('inventory').setDescription('Sahip olduğun ürünleri gör.'))
    .addSubcommand(sub => sub.setName('inv').setDescription('inventory için kısayol.'))
    .addSubcommand(sub => sub.setName('use').setDescription('Özel bir ürün kullan (ör. lootbox, booster).').addStringOption(opt => opt.setName('item').setDescription('Ürün adı').setRequired(true)))
    .addSubcommand(sub => sub.setName('gamble').setDescription('Yazı tura ile paranı riske at.').addIntegerOption(opt => opt.setName('amount').setDescription('Bahis miktarı').setRequired(true)))
    .addSubcommand(sub => sub.setName('slots').setDescription('Slot makinesi oyunu.').addIntegerOption(opt => opt.setName('amount').setDescription('Oyun miktarı').setRequired(true)))
    .addSubcommand(sub => sub.setName('rob').setDescription('Birini soymaya çalış (riskli ve beklemeli).').addUserOption(opt => opt.setName('user').setDescription('Soyulacak kullanıcı').setRequired(true)))
    .addSubcommand(sub => sub.setName('crime').setDescription('Suç işle, ödül veya ceza al.'))
    .addSubcommand(sub => sub.setName('leaderboard').setDescription('En zenginleri göster.'))
    .addSubcommand(sub => sub.setName('networth').setDescription('Toplam para + envanter değeri.')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    // --- Mağaza Sayfalama ---
    if (sub === 'store') {
      const items = getStoreItems();
      if (items.length === 0) {
        await interaction.reply({ content: '🛒 Mağazada şu anda ürün yok.' });
        return;
      }
      function buildStoreEmbed(page) {
        const start = page * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageItems = items.slice(start, end);
        const embed = new EmbedBuilder()
          .setTitle('🛒 Mağaza')
          .setDescription(pageItems.map((item, i) => `**${start + i + 1}.** ${item.name} — ${formatCurrency(item.price)}`).join('\n'))
          .setFooter({ text: `Sayfa ${page + 1} / ${Math.ceil(items.length / ITEMS_PER_PAGE)}` })
          .setColor(0x00bfff);
        return embed;
      }
      function buildButtonRow(page, maxPage) {
        return new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('store_prev')
            .setLabel('Önceki')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId('store_next')
            .setLabel('Sonraki')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === maxPage)
        );
      }
      let page = 0;
      const maxPage = Math.max(0, Math.ceil(items.length / ITEMS_PER_PAGE) - 1);
      const reply = await interaction.reply({
        embeds: [buildStoreEmbed(page)],
        components: maxPage > 0 ? [buildButtonRow(page, maxPage)] : [],
        fetchReply: true,
      });
      if (maxPage === 0) return;
      const collector = reply.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        time: 60_000,
      });
      collector.on('collect', async i => {
        if (i.customId === 'store_prev' && page > 0) page--;
        else if (i.customId === 'store_next' && page < maxPage) page++;
        await i.update({
          embeds: [buildStoreEmbed(page)],
          components: [buildButtonRow(page, maxPage)],
        });
      });
      collector.on('end', async () => {
        if (reply.editable) await reply.edit({ components: [] }).catch(() => {});
      });
    }
    // --- Mağaza Yönetimi (Sadece Sahip) ---
    else if (sub === 'additem') {
      if (userId !== OWNER_ID) {
        await interaction.reply({ content: '❌ Sadece bot sahibi mağazaya ürün ekleyebilir.', ephemeral: true });
        return;
      }
      const name = interaction.options.getString('name');
      const price = interaction.options.getInteger('price');
      const success = addStoreItem(name, price);
      if (success) {
        await interaction.reply({ content: `🛒 **${name}** mağazaya ${formatCurrency(price)} fiyatıyla eklendi!` });
      } else {
        await interaction.reply({ content: `⚠️ **${name}** zaten mağazada var.` });
      }
    } else if (sub === 'removeitem') {
      if (userId !== OWNER_ID) {
        await interaction.reply({ content: '❌ Sadece bot sahibi mağazadan ürün silebilir.', ephemeral: true });
        return;
      }
      const name = interaction.options.getString('name');
      const success = removeStoreItem(name);
      if (success) {
        await interaction.reply({ content: `🗑️ **${name}** mağazadan silindi!` });
      } else {
        await interaction.reply({ content: `⚠️ **${name}** mağazada bulunamadı.` });
      }
    }
    // --- Bakiye ---
    else if (sub === 'balance') {
      const econ = getUserEconomy(userId);
      await interaction.reply({ content: `💰 Cüzdan: ${formatCurrency(econ.wallet)}\n🏦 Banka: ${formatCurrency(econ.bank)}` });
    }
    // --- Günlük ---
    else if (sub === 'daily') {
      const econ = getUserEconomy(userId);
      const now = Date.now();
      const DAY = 24 * 60 * 60 * 1000;
      if (now - econ.lastDaily < DAY) {
        const next = new Date(econ.lastDaily + DAY);
        await interaction.reply({ content: `⏳ Günlük ödülünü zaten aldın! Tekrar alabilmek için <t:${Math.floor(next.getTime() / 1000)}:R> bekle.` });
        return;
      }
      const reward = Math.floor(Math.random() * 500) + 250;
      econ.wallet += reward;
      econ.lastDaily = now;
      setUserEconomy(userId, econ);
      await interaction.reply({ content: `🎁 Günlük ödülünü aldın: ${formatCurrency(reward)}!` });
    }
    // --- Çalış ---
    else if (sub === 'work') {
      const jobs = [
        { desc: "Baristalık yaptın", min: 100, max: 200 },
        { desc: "Pizza dağıttın", min: 80, max: 180 },
        { desc: "Web sitesi kodladın", min: 150, max: 300 },
        { desc: "Köpek gezdirdin", min: 50, max: 120 },
        { desc: "Çim biçtin", min: 70, max: 150 }
      ];
      const job = jobs[Math.floor(Math.random() * jobs.length)];
      const amount = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
      const econ = getUserEconomy(userId);
      econ.wallet += amount;
      setUserEconomy(userId, econ);
      await interaction.reply({ content: `💼 ${job.desc} ve ${formatCurrency(amount)} kazandın!` });
    }
    // --- Dilen ---
    else if (sub === 'beg') {
      const amounts = [5, 10, 20, 50, 0];
      const amount = amounts[Math.floor(Math.random() * amounts.length)];
      const econ = getUserEconomy(userId);
      if (amount > 0) {
        econ.wallet += amount;
        setUserEconomy(userId, econ);
        await interaction.reply({ content: `🙏 Birisi sana ${formatCurrency(amount)} verdi!` });
      } else {
        await interaction.reply({ content: "😢 Kimse sana para vermedi." });
      }
    }
    // --- Para Yatır ---
    else if (sub === 'deposit') {
      const amount = interaction.options.getInteger('amount');
      const econ = getUserEconomy(userId);
      if (amount <= 0) {
        await interaction.reply({ content: '❌ Miktar pozitif olmalı.' });
        return;
      }
      if (econ.wallet < amount) {
        await interaction.reply({ content: '❌ Cüzdanında yeterli paran yok.' });
        return;
      }
      econ.wallet -= amount;
      econ.bank += amount;
      setUserEconomy(userId, econ);
      await interaction.reply({ content: `🏦 Bankaya ${formatCurrency(amount)} yatırdın!` });
    }
    // --- Para Çek ---
    else if (sub === 'withdraw') {
      const amount = interaction.options.getInteger('amount');
      const econ = getUserEconomy(userId);
      if (amount <= 0) {
        await interaction.reply({ content: '❌ Miktar pozitif olmalı.' });
        return;
      }
      if (econ.bank < amount) {
        await interaction.reply({ content: '❌ Bankanda yeterli paran yok.' });
        return;
      }
      econ.bank -= amount;
      econ.wallet += amount;
      setUserEconomy(userId, econ);
      await interaction.reply({ content: `💸 Bankadan ${formatCurrency(amount)} çektin!` });
    }
    // --- Satın Al ---
    else if (sub === 'buy') {
      const itemName = interaction.options.getString('item');
      const items = getStoreItems();
      const item = items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
      if (!item) {
        await interaction.reply({ content: `❌ **${itemName}** mağazada bulunamadı.` });
        return;
      }
      const econ = getUserEconomy(userId);
      if (econ.wallet < item.price) {
        await interaction.reply({ content: `❌ **${item.name}** almak için yeterli paran yok.` });
        return;
      }
      econ.wallet -= item.price;
      setUserEconomy(userId, econ);
      const inv = getUserInventory(userId);
      inv.push(item.name);
      setUserInventory(userId, inv);
      await interaction.reply({ content: `🛍️ **${item.name}** satın alındı! (${formatCurrency(item.price)})` });
    }
    // --- Sat ---
    else if (sub === 'sell') {
      const itemName = interaction.options.getString('item');
      const inv = getUserInventory(userId);
      const idx = inv.findIndex(i => i.toLowerCase() === itemName.toLowerCase());
      if (idx === -1) {
        await interaction.reply({ content: `❌ Envanterinde **${itemName}** yok.` });
        return;
      }
      const items = getStoreItems();
      const item = items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
      const sellPrice = item ? Math.floor(item.price * 0.5) : 10;
      inv.splice(idx, 1);
      setUserInventory(userId, inv);
      const econ = getUserEconomy(userId);
      econ.wallet += sellPrice;
      setUserEconomy(userId, econ);
      await interaction.reply({ content: `💸 **${itemName}** ${formatCurrency(sellPrice)} karşılığında satıldı!` });
    }
    // --- Envanter ---
    else if (sub === 'inventory' || sub === 'inv') {
      const inv = getUserInventory(userId);
      if (inv.length === 0) {
        await interaction.reply({ content: '🎒 Envanterin boş.' });
        return;
      }
      const counts = {};
      for (const item of inv) counts[item] = (counts[item] || 0) + 1;
      const desc = Object.entries(counts).map(([name, count]) => `• **${name}** x${count}`).join('\n');
      await interaction.reply({ content: `🎒 Envanterin:\n${desc}` });
    }
    // --- Kullan ---
    else if (sub === 'use') {
      const itemName = interaction.options.getString('item');
      const inv = getUserInventory(userId);
      const idx = inv.findIndex(i => i.toLowerCase() === itemName.toLowerCase());
      if (idx === -1) {
        await interaction.reply({ content: `❌ Envanterinde **${itemName}** yok.` });
        return;
      }
      // Örnek: lootbox para verir, booster 1 saat double work, vs.
      let result = `🧪 **${itemName}** kullandın!`;
      if (itemName.toLowerCase() === 'lootbox') {
        const reward = Math.floor(Math.random() * 500) + 100;
        const econ = getUserEconomy(userId);
        econ.wallet += reward;
        setUserEconomy(userId, econ);
        result += ` Lootbox açtın ve ${formatCurrency(reward)} buldun!`;
      }
      inv.splice(idx, 1);
      setUserInventory(userId, inv);
      await interaction.reply({ content: result });
    }
    // --- Kumar ---
    else if (sub === 'gamble') {
      const amount = interaction.options.getInteger('amount');
      const econ = getUserEconomy(userId);
      if (amount <= 0) {
        await interaction.reply({ content: '❌ Miktar pozitif olmalı.' });
        return;
      }
      if (econ.wallet < amount) {
        await interaction.reply({ content: '❌ Kumar oynamak için yeterli paran yok.' });
        return;
      }
      const win = Math.random() < 0.5;
      if (win) econ.wallet += amount;
      else econ.wallet -= amount;
      setUserEconomy(userId, econ);
      await interaction.reply({ content: win ? `🎲 ${formatCurrency(amount)} ile kumar oynadın ve kazandın! Şanslısın!` : `🎲 ${formatCurrency(amount)} ile kumar oynadın ve kaybettin! Bir dahaki sefere!` });
    }
    // --- Slot ---
    else if (sub === 'slots') {
      const amount = interaction.options.getInteger('amount');
      const econ = getUserEconomy(userId);
      if (amount <= 0) {
        await interaction.reply({ content: '❌ Miktar pozitif olmalı.' });
        return;
      }
      if (econ.wallet < amount) {
        await interaction.reply({ content: '❌ Slot oynamak için yeterli paran yok.' });
        return;
      }
      const emojis = ['🍒', '🍋', '🍊', '🍉', '🍇', '7️⃣'];
      const slot = () => emojis[Math.floor(Math.random() * emojis.length)];
      const result = [slot(), slot(), slot()];
      const win = result[0] === result[1] && result[1] === result[2];
      if (win) econ.wallet += amount * 5;
      else econ.wallet -= amount;
      setUserEconomy(userId, econ);
      await interaction.reply({ content: `🎰 [${result.join(' ')}] ${win ? `Jackpot! ${formatCurrency(amount * 5)} kazandın!` : 'Bu sefer olmadı!'}` });
    }
    // --- Soy ---
    else if (sub === 'rob') {
      const target = interaction.options.getUser('user');
      if (target.id === userId) {
        await interaction.reply({ content: '❌ Kendini soyamazsın.' });
        return;
      }
      const econ = getUserEconomy(userId);
      const targetEcon = getUserEconomy(target.id);
      if (targetEcon.wallet < 100) {
        await interaction.reply({ content: `❌ ${target.username} soymak için yeterli paraya sahip değil.` });
        return;
      }
      const success = Math.random() < 0.5;
      if (success) {
        const stolen = Math.floor(targetEcon.wallet * (Math.random() * 0.3 + 0.1)); // %10-%40
        econ.wallet += stolen;
        targetEcon.wallet -= stolen;
        setUserEconomy(userId, econ);
        setUserEconomy(target.id, targetEcon);
        await interaction.reply({ content: `🦹 ${target.username} kullanıcısını soydun ve ${formatCurrency(stolen)} aldın!` });
      } else {
        const penalty = Math.floor(econ.wallet * 0.2);
        econ.wallet -= penalty;
        setUserEconomy(userId, econ);
        await interaction.reply({ content: `🦹 ${target.username} kullanıcısını soymaya çalıştın ama yakalandın! ${formatCurrency(penalty)} kaybettin.` });
      }
    }
    // --- Suç ---
    else if (sub === 'crime') {
      const econ = getUserEconomy(userId);
      const outcomes = [
        { msg: "🚔 Başarılı bir soygun yaptın ve", amount: Math.floor(Math.random() * 500) + 200 },
        { msg: "🚨 Suç işlerken yakalandın ve ceza olarak", amount: -Math.floor(Math.random() * 300) - 100 },
        { msg: "😎 Yankesicilik denedin ama başaramadın. Bir dahaki sefere!", amount: 0 }
      ];
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      if (outcome.amount > 0) econ.wallet += outcome.amount;
      else if (outcome.amount < 0) econ.wallet += outcome.amount;
      setUserEconomy(userId, econ);
      await interaction.reply({ content: outcome.amount === 0 ? outcome.msg : `${outcome.msg} ${formatCurrency(Math.abs(outcome.amount))}!` });
    }
    // --- Lider Tablosu ---
    else if (sub === 'leaderboard') {
      const db = readJSON(ECONOMY_PATH, {});
      const sorted = Object.entries(db)
        .map(([uid, econ]) => ({ uid, total: (econ.wallet || 0) + (econ.bank || 0) }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
      if (sorted.length === 0) {
        await interaction.reply({ content: '🏆 Henüz lider tablosunda kullanıcı yok.' });
        return;
      }
      const lines = await Promise.all(sorted.map(async (entry, i) => {
        const user = await interaction.client.users.fetch(entry.uid).catch(() => null);
        return `**${i + 1}.** ${user ? user.username : 'Bilinmiyor'} — ${formatCurrency(entry.total)}`;
      }));
      await interaction.reply({ content: `🏆 Lider Tablosu:\n${lines.join('\n')}` });
    }
    // --- Net Değer ---
    else if (sub === 'networth') {
      const econ = getUserEconomy(userId);
      const inv = getUserInventory(userId);
      const items = getStoreItems();
      let invValue = 0;
      for (const itemName of inv) {
        const item = items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
        invValue += item ? Math.floor(item.price * 0.5) : 10;
      }
      const total = econ.wallet + econ.bank + invValue;
      await interaction.reply({ content: `💎 Net değeriniz: ${formatCurrency(total)} (nakit + envanter değeri)` });
    }
    // --- Fallback ---
    else {
      await interaction.reply({ content: `🎉 /economy ${sub} çalıştı!` });
    }
  },
};
