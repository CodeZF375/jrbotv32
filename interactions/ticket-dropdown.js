const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } = require('discord.js');
const { loadConfig } = require('../utils/ticketUtils');

module.exports = {
  customId: 'ticket-category',
  /**
   * Handles the dropdown selection for ticket creation.
   * @param {import('discord.js').StringSelectMenuInteraction} interaction
   */
  async execute(interaction) {
    const config = loadConfig();
    const selected = interaction.values[0];
    const member = interaction.member;
    const guild = interaction.guild;

    // Check if user already has an open ticket
    const existing = guild.channels.cache.find(
      ch => ch.topic && ch.topic.includes(`Ticket for ${member.id}`)
    );
    if (existing) {
      return interaction.reply({ content: '❗ You already have an open ticket: ' + existing.toString(), ephemeral: false });
    }

    let reason = selected;
    // If "Other", prompt for issue before creating the ticket
    if (selected === 'other') {
      await interaction.reply({ content: 'Please type your issue for the ticket (you have 60 seconds):', ephemeral: false });
      const filter = m => m.author.id === member.id;
      try {
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
        reason = collected.first().content;
        await collected.first().delete().catch(() => {});
      } catch {
        return interaction.followUp({ content: '⏰ Timed out. Please try again.', ephemeral: false });
      }
    } else {
      // Use label as reason for other categories
      reason = config.dropdownOptions.find(opt => opt.value === selected)?.label || selected;
      await interaction.reply({ content: 'Creating your ticket...', ephemeral: false });
    }

    // Create ticket channel
    const category = guild.channels.cache.get(config.ticketCategoryId);
    const supportRole = config.supportRoleId;
    const channelName = `ticket-${member.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '');

    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category ? category.id : null,
      topic: `Ticket for ${member.id}`,
      permissionOverwrites: [
        { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
        { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
        { id: supportRole, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
      ]
    });

    // Send ticket embed with close button
    const ticketEmbed = new EmbedBuilder()
      .setTitle('🎫 New Ticket')
      .setDescription(`**User:** <@${member.id}>\n**Reason:** ${reason}`)
      .setColor(0x2ecc71)
      .setTimestamp();

    const closeBtn = new ButtonBuilder()
      .setCustomId('ticket-close')
      .setLabel('Close Ticket')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(closeBtn);

    await channel.send({ content: `<@${member.id}> <@&${supportRole}>`, embeds: [ticketEmbed], components: [row] });

    await interaction.followUp({ content: `✅ Ticket created: ${channel}`, ephemeral: false });
  }
};
