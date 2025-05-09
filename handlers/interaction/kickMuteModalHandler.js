const { 
    EmbedBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder 
} = require('discord.js');

// Kick Modal Handler
async function handleKickModalInteraction(interaction) {
    // Handle button click to show modal
    if (interaction.isButton() && interaction.customId.startsWith('kick_modal_')) {
        const targetId = interaction.customId.split('_').pop();
        const target = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (!target) {
            return interaction.reply({ content: 'User not found.', ephemeral: false });
        }

        const modal = new ModalBuilder()
            .setCustomId(`kick_modal_submit_${target.id}`)
            .setTitle(`Kick ${target.user.tag}`);

        const reasonInput = new TextInputBuilder()
            .setCustomId('kick_reason')
            .setLabel('Kick Reason')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Enter the reason for the kick')
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(reasonInput)
        );

        await interaction.showModal(modal);
        return;
    }

    // Handle cancel button
    if (interaction.isButton() && interaction.customId === 'kick_cancel') {
        const cancelEmbed = new EmbedBuilder()
            .setTitle('Kick Cancelled')
            .setDescription('Kick action has been cancelled.')
            .setColor(0x0099ff);

        await interaction.update({
            embeds: [cancelEmbed],
            components: []
        });
        return;
    }

    // Handle modal submission
    if (interaction.isModalSubmit() && interaction.customId.startsWith('kick_modal_submit_')) {
        const targetId = interaction.customId.split('_').pop();
        const target = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (!target) {
            return interaction.reply({ content: 'User not found.', ephemeral: false });
        }

        const reason = interaction.fields.getTextInputValue('kick_reason');

        // Execute the kick
        await target.kick(reason);

        const successEmbed = new EmbedBuilder()
            .setTitle('User Kicked')
            .setDescription(`Successfully kicked **${target.user.tag}**\n**Reason:** ${reason}`)
            .setColor(0x00ff00)
            .setTimestamp();

        await interaction.reply({
            embeds: [successEmbed],
            components: [],
            ephemeral: false
        });
        return;
    }
}

// Mute Modal Handler
async function handleMuteModalInteraction(interaction) {
    // Handle button click to show modal
    if (interaction.isButton() && interaction.customId.startsWith('mute_modal_')) {
        const targetId = interaction.customId.split('_').pop();
        const target = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (!target) {
            return interaction.reply({ content: 'User not found.', ephemeral: false });
        }

        const modal = new ModalBuilder()
            .setCustomId(`mute_modal_submit_${target.id}`)
            .setTitle(`Mute ${target.user.tag}`);

        const reasonInput = new TextInputBuilder()
            .setCustomId('mute_reason')
            .setLabel('Mute Reason')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Enter the reason for the mute')
            .setRequired(true);

        const durationInput = new TextInputBuilder()
            .setCustomId('mute_duration')
            .setLabel('Mute Duration (e.g., 10m, 1h, 1d)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g., 10m, 1h, 1d')
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(reasonInput),
            new ActionRowBuilder().addComponents(durationInput)
        );

        await interaction.showModal(modal);
        return;
    }

    // Handle cancel button
    if (interaction.isButton() && interaction.customId === 'mute_cancel') {
        const cancelEmbed = new EmbedBuilder()
            .setTitle('Mute Cancelled')
            .setDescription('Mute action has been cancelled.')
            .setColor(0x0099ff);

        await interaction.update({
            embeds: [cancelEmbed],
            components: []
        });
        return;
    }

    // Handle modal submission
    if (interaction.isModalSubmit() && interaction.customId.startsWith('mute_modal_submit_')) {
        const targetId = interaction.customId.split('_').pop();
        const target = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (!target) {
            return interaction.reply({ content: 'User not found.', ephemeral: false });
        }

        const reason = interaction.fields.getTextInputValue('mute_reason');
        const durationRaw = interaction.fields.getTextInputValue('mute_duration');

        // Parse duration (simple: m/h/d to ms)
        let durationMs = null;
        const match = durationRaw.match(/^(\d+)([mhd])$/i);
        if (match) {
            const value = parseInt(match[1]);
            const unit = match[2].toLowerCase();
            if (unit === 'm') durationMs = value * 60 * 1000;
            else if (unit === 'h') durationMs = value * 60 * 60 * 1000;
            else if (unit === 'd') durationMs = value * 24 * 60 * 60 * 1000;
        }
        if (!durationMs) {
            return interaction.reply({ content: 'Invalid duration format. Use e.g. 10m, 1h, 1d.', ephemeral: false });
        }

        // Execute the mute (timeout)
        await target.timeout(durationMs, reason);

        const successEmbed = new EmbedBuilder()
            .setTitle('User Muted')
            .setDescription(`Successfully muted **${target.user.tag}**\n**Reason:** ${reason}\n**Duration:** ${durationRaw}`)
            .setColor(0x00ff00)
            .setTimestamp();

        await interaction.reply({
            embeds: [successEmbed],
            components: [],
            ephemeral: false
        });
        return;
    }
}

module.exports = { handleKickModalInteraction, handleMuteModalInteraction };