const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verify a user and assign them a role')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to verify')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('The verification role to assign')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName('choice_role')
        .setDescription('Choose 1 role from 3 options')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const targetUser = interaction.options.getUser('user');
    const verifyRole = interaction.options.getRole('role');
    const choiceRole = interaction.options.getRole('choice_role');

    try {
      // Get the member object
      const member = await interaction.guild.members.fetch(targetUser.id);

      // Check if the command user has the verify role
      if (!interaction.member.roles.cache.has(verifyRole.id)) {
        return interaction.reply({
          content: `❌ You need the ${verifyRole} role to use this command!`,
          ephemeral: true
        });
      }

      // Give the user both roles
      await member.roles.add(verifyRole);
      await member.roles.add(choiceRole);

      await interaction.reply({
        content: `✅ Successfully verified ${targetUser} with roles:\n- ${verifyRole}\n- ${choiceRole}`,
        ephemeral: false
      });

    } catch (error) {
      console.error('Error in verify command:', error);
      await interaction.reply({
        content: '❌ An error occurred while verifying the user!',
        ephemeral: true
      });
    }
  }
};
