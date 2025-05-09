const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const moment = require('moment');
const chalk = require('chalk');
const { loadConfig, saveConfig } = require('../utils/ticketUtils');
const ayarlar = require('../ayarlar.json'); // Assuming this file exists

const TICKET_MENU_CHANNEL_ID = process.env.TICKET_MENU_CHANNEL_ID || loadConfig().ticketMenuChannelId;

module.exports = {
  name: 'ready',
  once: true,
  /**
   * Executes the ready event logic.
   * @param {import('discord.js').Client} client - The Discord client.
   */
  async execute(client) {
    console.log(chalk.green(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] BOT: Aktif, Komutlar yüklendi!`));
    console.log(chalk.green(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] BOT: ${client.user.username} ismi ile giriş yapıldı!`));

    // --- Status Rotation Logic ---
    const oyun = [
      "Selam",
      "Yardım için /yardım",
    ];

    let statusIndex = 0;

    /**
     * Updates the bot's status with the next message in the rotation.
     */
    function updateStatus() {
      if (!client.user) {
        console.error('[StatusRotator] Client user is not ready yet.');
        return;
      }

      const random = Math.floor(Math.random() * oyun.length);
      client.user.setActivity(oyun[random], { type: 'STREAMING', url: "https://www.twitch.tv/mbasreaper" })
        .catch(err => console.error('[StatusRotator] Failed to set activity:', err));
    }

    // Set the initial status and start the interval
    updateStatus();
    setInterval(updateStatus, 2 * 2500);

    // Set initial status
    client.user.setStatus('online');
    console.log(chalk.green(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] BOT: Oyun ismi ayarlandı!`));
    console.log(chalk.green(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] BOT: Şu an ${client.channels.cache.size} adet kanala, ${client.guilds.cache.size} adet sunucuya ve ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} kullanıcıya hizmet veriliyor!`));

    // --- Ticket Menu Logic ---
    const config = loadConfig();

    console.log(chalk.blue('[TicketMenu] Ready event fired. menuSent:'), config.menuSent);

    if (!config.menuSent) {
      if (!TICKET_MENU_CHANNEL_ID) {
        console.error(chalk.red('[TicketMenu] TICKET_MENU_CHANNEL_ID is not defined!'));
        return;
      }

      let channel;
      try {
        channel = await client.channels.fetch(TICKET_MENU_CHANNEL_ID);
      } catch (err) {
        console.error(chalk.red('[TicketMenu] Failed to fetch the ticket menu channel:', err));
        return;
      }

      // Check if the channel is a valid text channel
      if (!channel || channel.type !== ChannelType.GuildText) {
        console.error(chalk.red(`[TicketMenu] Channel ${TICKET_MENU_CHANNEL_ID} is not a valid text channel. Type:`, channel && channel.type));
        return;
      }

      // Create an embed for the ticket menu
      const embed = new EmbedBuilder()
        .setTitle('🎫 Yardıma mı ihtiyacın var?')
        .setDescription('Aşağıdaki butona tıklayarak destek bileti açabilirsin. Ekibimiz en kısa sürede yardımcı olacak.')
        .setColor(0x00bfff);

      // Create a button for opening tickets
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('open-ticket-modal')
          .setLabel('Bilet Aç')
          .setStyle(ButtonStyle.Primary)
      );

      try {
        await channel.send({ embeds: [embed], components: [row] });
        config.menuSent = true;
        saveConfig(config);
        console.log(chalk.green('[TicketMenu] Ticket menu successfully sent to channel:', TICKET_MENU_CHANNEL_ID));
      } catch (err) {
        console.error(chalk.red('[TicketMenu] Failed to send the ticket menu:', err));
      }
    } else {
      console.log(chalk.blue('[TicketMenu] Ticket menu has already been sent, skipping.'));
    }
  },
};