const { SlashCommandBuilder } = require('discord.js');

const OWNER_ID = process.env.OWNER_ID || '791741859423584286';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear-dm')
    .setDescription('Delete as many DMs as possible between the bot and a user (owner only, by user ID)')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('The user ID whose DM channel to clear')
        .setRequired(true)
    ),

  async execute(interaction) {
    // Only allow the owner to use this command
    if (interaction.user.id !== OWNER_ID) {
      await interaction.reply({ content: '❌ Only the bot owner can use this command.', ephemeral: true });
      return;
    }

    const userId = interaction.options.getString('id');
    if (!userId || !/^\d{17,20}$/.test(userId)) {
      await interaction.reply({ content: '❌ Invalid user ID.', ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      // Fetch the user by ID
      const user = await interaction.client.users.fetch(userId);
      if (!user) {
        await interaction.editReply({ content: '❌ User not found.' });
        return;
      }

      // Open a DM channel with the user
      const dmChannel = await user.createDM();

      // Fetch messages in batches and delete those sent by the bot
      let deletedCount = 0;
      let lastId;
      while (true) {
        // Fetch up to 100 messages at a time
        const messages = await dmChannel.messages.fetch({ limit: 100, before: lastId });
        if (messages.size === 0) break;

        // Filter messages sent by the bot
        const botMessages = messages.filter(msg => msg.author.id === interaction.client.user.id);

        for (const msg of botMessages.values()) {
          try {
            await msg.delete();
            deletedCount++;
          } catch (e) {
            // Ignore errors (e.g., message too old)
          }
        }

        // Prepare for next batch
        lastId = messages.last().id;
        // If there are no more bot messages, break early
        if (messages.size < 100) break;
      }

      await interaction.editReply({ content: `✅ Deleted ${deletedCount} DM messages sent by the bot to <@${user.id}> (${user.id}).` });
    } catch (err) {
      await interaction.editReply({ content: `❌ Failed to clear DMs: ${err.message}` });
    }
  }
};