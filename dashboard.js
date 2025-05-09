require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const client = require('./jrbot'); // Ensure jrbot.js exports the initialized client
const { version: discordJsVersion } = require('discord.js');

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3000;

// Set up EJS for templating
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Set up session management
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: true,
  })
);

// Dashboard Home Route
app.get('/', async (req, res) => {
  try {
    if (!client.user) {
      req.session.message = '❌ Bot henüz hazır değil!';
      return res.render('dashboard', { stats: null, message: req.session.message });
    }

    // Collect bot stats
    const stats = {
      botName: client.user.username,
      botAvatar: client.user.displayAvatarURL(),
      guildCount: client.guilds.cache.size,
      userCount: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
      channelCount: client.channels.cache.size,
      uptime: formatUptime(client.uptime),
      memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
      nodeVersion: process.version,
      discordJsVersion,
      owner: process.env.OWNER_ID || 'Unknown',
    };

    // Render the dashboard
    res.render('dashboard', { stats, message: req.session.message || null });
    req.session.message = null;
  } catch (err) {
    console.error('[Dashboard Error]', err);
    res.status(500).send('Internal Server Error');
  }
});

// Send a Message as the Bot
app.post('/send-message', async (req, res) => {
  const { channelId, message } = req.body;

  try {
    const channel = await client.channels.fetch(channelId);
    if (channel && channel.isTextBased()) {
      await channel.send(message);
      req.session.message = '✅ Mesaj başarıyla gönderildi!';
    } else {
      req.session.message = '❌ Kanal bulunamadı veya metin kanalı değil!';
    }
  } catch (err) {
    console.error('[Send Message Error]', err);
    req.session.message = `❌ Hata: ${err.message}`;
  }

  res.redirect('/');
});

// Helper: Format Uptime
function formatUptime(ms) {
  if (!ms) return 'N/A';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    days ? `${days}g` : null,
    hours ? `${hours}s` : null,
    minutes ? `${minutes}d` : null,
    `${seconds}s`,
  ]
    .filter(Boolean)
    .join(' ');
}

// Start the Dashboard
app.listen(PORT, () => {
  console.log(`✅ Dashboard running at http://localhost:${PORT}`);
});