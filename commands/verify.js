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
      // Check if the verify role is in the allowed list
      if (!ALLOWED_VERIFY_ROLES.includes(verifyRole.id)) {
        return interaction.reply({
          content: `❌ The role ${verifyRole} is not allowed to be assigned!`,
          ephemeral: true
        });
      }

      // Check if the choice role is in the allowed list
      if (!ALLOWED_CHOICE_ROLES.includes(choiceRole.id)) {
        return interaction.reply({
          content: `❌ The role ${choiceRole} is not in the allowed choice roles!`,
          ephemeral: true
        });
      }

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
      await member.roles.add(ASSIGN_ROLE);
      await member.roles.add(choiceRole);

      await interaction.reply({
        content: `✅ Successfully verified <@${targetUser.id}> with roles:\n- <@&${ASSIGN_ROLE}>\n- <@&${choiceRole.id}>`,
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
