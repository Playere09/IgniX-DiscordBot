const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Configuration - Set your allowed role IDs here
const ALLOWED_VERIFY_ROLES = ['1430101468253388851']; // IDs of roles that can use this command
const ALLOWED_CHOICE_ROLES = [
  '1430101502244163644', // Sword
  '1430101478240157696', // Grinder
  '1430101478231773266'  // Crystal
];
const ASSIGN_ROLE = '1430101478776766475'; // Role to be given to all verified users

// Data file path
const dataPath = path.join(__dirname, '../data/verifications.json');

// Load or create data
function loadData() {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify({ verifications: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

// Save data
function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

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
          { name: 'Sword', value: '1430101502244163644' },
          { name: 'Grinder', value: '1430101478240157696' },
          { name: 'Crystal', value: '1430101478231773266' }
        )
    ),

  async execute(interaction, client) {
    const targetUser = interaction.options.getUser('user');
    const choiceRoleId = interaction.options.getString('role');
    const verifierId = interaction.user.id;

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

      // Load and update data
      const data = loadData();
      const userId = targetUser.id;
      
      if (!data.verifications[userId]) {
        data.verifications[userId] = {
          count: 0,
          verifiedBy: [],
          roles: []
        };
      }
      
      data.verifications[userId].count += 1;
      data.verifications[userId].verifiedBy.push({
        verifierId: verifierId,
        timestamp: new Date().toISOString()
      });
      data.verifications[userId].roles.push({
        roleId: choiceRoleId,
        verifierId: verifierId,
        timestamp: new Date().toISOString()
      });
      
      saveData(data);

      const roleNames = {
        '1430101502244163644': 'Sword',
        '1430101478240157696': 'Grinder',
        '1430101478231773266': 'Crystal'
      };

      await interaction.reply({
        content: `✅ Successfully verified <@${targetUser.id}> with roles:\n- <@&${ASSIGN_ROLE}>\n- ${roleNames[choiceRoleId]}`,
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
