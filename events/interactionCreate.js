const { ChannelType } = require('discord.js');
const { loadConfig } = require('../utils/ticketUtils');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // Only handle button interactions for the ticket panel
    if (interaction.isButton() && interaction.customId === 'open-ticket-modal') {
      try {
        const config = loadConfig();

        if (!config.ticketCategoryId || !config.supportRoleId) {
          await interaction.reply({ content: '❌ Ticket system is not configured. Please ask an admin to run `/ticket setup`.', ephemeral: false });
          return;
        }

      // Prevent multiple tickets per user
      const existing = interaction.guild.channels.cache.find(
        ch =>
          ch.parentId === config.ticketCategoryId &&
          ch.topic &&
          ch.topic.includes(`Ticket Owner: ${interaction.user.id}`)
      );
      if (existing) {
        await interaction.reply({ content: `❗ You already have an open ticket: <#${existing.id}>`, ephemeral: false });
        return;
      }

      // Sanitize channel name
      function sanitizeChannelName(name) {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 90);
      }

      const channelName = sanitizeChannelName(`ticket-${interaction.user.username}`);
      const category = interaction.guild.channels.cache.get(config.ticketCategoryId);
      if (!category || category.type !== ChannelType.GuildCategory) {
        await interaction.reply({ content: '❌ Ticket category is invalid. Please ask an admin to check `/ticket settings`.', ephemeral: false });
        return;
      }

      const ticketChannel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category.id,
        topic: `Ticket Owner: ${interaction.user.id} | Opened: ${new Date().toISOString()}`,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: ['ViewChannel'],
          },
          {
            id: interaction.user.id,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
          },
          {
            id: config.supportRoleId,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
          },
        ],
      });

      await ticketChannel.send({
        content: `🎫 Welcome <@${interaction.user.id}>! Please describe your issue. Our <@&${config.supportRoleId}> team will assist you soon.`,
      });

      await interaction.reply({ content: `✅ Your ticket has been created: <#${ticketChannel.id}>`, ephemeral: false });
      } catch (err) {
        console.error('Ticket panel button error:', err);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: '❌ An error occurred while creating your ticket.', ephemeral: false });
        }
      }
    }
  }
};
