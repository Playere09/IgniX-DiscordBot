const { SlashCommandBuilder } = require('discord.js');

// Configuration - Set your allowed role IDs here
const ALLOWED_VERIFY_ROLES = ['1430101468253388851']; // IDs of roles that can use this command
const ALLOWED_CHOICE_ROLES = [
  '1430101502244163644', // Role option 1
  '1430101478240157696', // Role option 2
  '1430101478231773266'  // Role option 3
];
const ASSIGN_ROLE = '1430101478776766475'; // Role to be given to all verified users

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
    .addStringOption(option =>
      option
        .setName('role')
        .setDescription('Choose 1 role from 3 options')
        .setRequired(true)
        .addChoices(
          { name: 'Role 1', value: '1430101502244163644' },
          { name: 'Role 2', value: '1430101478240157696' },
          { name: 'Role 3', value: '1430101478231773266' }
        )
    ),

  async execute(interaction, client) {
    const targetUser = interaction.options.getUser('user');
    const choiceRoleId = interaction.options.getString('role');

    try {
      // Get the member object
      const member = await interaction.guild.members.fetch(targetUser.id);

      // Check if the command user has the verify role
      if (!interaction.member.roles.cache.has(ALLOWED_VERIFY_ROLES[0])) {
        return interaction.reply({
          content: `❌ You need the verify role to use this command!`,
          ephemeral: true
        });
      }

      // Give the user the assign role and the chosen role
      await member.roles.add(ASSIGN_ROLE);
      await member.roles.add(choiceRoleId);

      await interaction.reply({
        content: `✅ Successfully verified <@${targetUser.id}> with roles:\n- <@&${ASSIGN_ROLE}>\n- <@&${choiceRoleId}>`,
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
