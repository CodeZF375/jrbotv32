const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const OWNER_ID = process.env.OWNER_ID || '791741859423584286';


const BOT_OWNER_ID = '791741859423584286';

const LOG_PATH = path.join(__dirname, '../../log.json');
const RESTART_SIGNAL_PATH = path.join(__dirname, '../../restart-request.json');

function writeLogEntry(entry) {
  let log = [];
  try {
    if (fs.existsSync(LOG_PATH)) {
      log = JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'));
      if (!Array.isArray(log)) log = [];
    }
  } catch (e) {
    log = [];
  }
  log.push(entry);
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
}

function signalRestart(user) {
  const signal = {
    requestedBy: user.tag,
    userId: user.id,
    timestamp: new Date().toISOString(),
    action: 'restart'
  };
  fs.writeFileSync(RESTART_SIGNAL_PATH, JSON.stringify(signal, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Botu yeniden başlatır (sadece JrCode4 için).')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    if (interaction.user.id !== BOT_OWNER_ID) {
      return interaction.reply({ content: '❌ Bu komutu sadece bot sahibi kullanabilir.', ephemeral: false });
    }

    // Log the restart request
    writeLogEntry({
      type: 'restart',
      requestedBy: interaction.user.tag,
      userId: interaction.user.id,
      timestamp: new Date().toISOString()
    });

    // Signal to control.bat (or a watcher process) that a restart is requested
    signalRestart(interaction.user);

    await interaction.reply({ content: '♻️ Bot yeniden başlatılıyor... (Bu işlem birkaç saniye sürebilir)', ephemeral: false });

    // DO NOT call process.exit(0) here; let control.bat or the watcher handle the restart
  }
};