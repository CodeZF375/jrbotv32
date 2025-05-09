const { 
    EmbedBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder 
} = require('discord.js');

// This function should be called from your main interactionCreate event handler
async function handleBanModalInteraction(interaction) {
    // Handle button click to show modal
    if (interaction.isButton() && interaction.customId.startsWith('ban_modal_')) {
        const targetId = interaction.customId.split('_').pop();
        const target = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (!target) {
            return interaction.reply({ content: 'User not found.', ephemeral: false });
        }

        const modal = new ModalBuilder()
            .setCustomId(`ban_modal_submit_${target.id}`)
            .setTitle(`Ban ${target.user.tag}`);

        const reasonInput = new TextInputBuilder()
            .setCustomId('ban_reason')
            .setLabel('Ban Reason')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Enter the reason for the ban')
            .setRequired(true);

        const durationInput = new TextInputBuilder()
            .setCustomId('ban_duration')
            .setLabel('Ban Duration (e.g., 7d, permanent)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g., 7d, permanent')
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(reasonInput),
            new ActionRowBuilder().addComponents(durationInput)
        );

        await interaction.showModal(modal);
        return;
    }

    // Handle cancel button
    if (interaction.isButton() && interaction.customId === 'ban_cancel') {
        const cancelEmbed = new EmbedBuilder()
            .setTitle('Ban Cancelled')
            .setDescription('Ban action has been cancelled.')
            .setColor(0x0099ff);

        await interaction.update({
            embeds: [cancelEmbed],
            components: []
        });
        return;
    }

    // Handle modal submission
    if (interaction.isModalSubmit() && interaction.customId.startsWith('ban_modal_submit_')) {
        const targetId = interaction.customId.split('_').pop();
        const target = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (!target) {
            return interaction.reply({ content: 'User not found.', ephemeral: false });
        }

        const reason = interaction.fields.getTextInputValue('ban_reason');
        const duration = interaction.fields.getTextInputValue('ban_duration') || 'permanent';

        // Execute the ban
        await target.ban({ reason: `${reason} (Duration: ${duration})` });

        const successEmbed = new EmbedBuilder()
            .setTitle('User Banned')
            .setDescription(`Successfully banned **${target.user.tag}**\n**Reason:** ${reason}\n**Duration:** ${duration}`)
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

module.exports = { handleBanModalInteraction };