const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dmrole')
    .setDescription('Send a direct message to all users with a specific role')
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('The role to target')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('The message to send')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    // Check if user is the server owner
    if (interaction.user.id !== interaction.guild.ownerId) {
      return interaction.reply({
        content: '❌ Only the server owner can use this command!',
        ephemeral: true
      });
    }

    const role = interaction.options.getRole('role');
    const messageContent = interaction.options.getString('message');

    await interaction.deferReply({ ephemeral: true });

    try {
      // Fetch all members of the guild
      const members = await interaction.guild.members.fetch();

      // Filter members who have the specified role
      const membersWithRole = members.filter(member => member.roles.cache.has(role.id));

      if (membersWithRole.size === 0) {
        return interaction.editReply({
          content: `⚠️ No members found with the role ${role}`
        });
      }

      let successCount = 0;
      let failureCount = 0;

      // Send DM to each member
      for (const member of membersWithRole.values()) {
        try {
          // Don't DM bots
          if (member.user.bot) {
            failureCount++;
            continue;
          }

          await member.user.send(messageContent);
          successCount++;
        } catch (error) {
          console.error(`Failed to send DM to ${member.user.tag}:`, error.message);
          failureCount++;
        }
      }

      await interaction.editReply({
        content: `✅ Sent messages to ${successCount} users.\n⚠️ Failed: ${failureCount} users (may have DMs disabled or be bots)`
      });
    } catch (error) {
      console.error('Error in dmrole command:', error);
      await interaction.editReply({
        content: '❌ An error occurred while processing the command!'
      });
    }
  }
};
