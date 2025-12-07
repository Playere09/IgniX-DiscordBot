const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
const LOGS_CHANNEL_ID = '1430584575175692300'; // Channel to post logs to

// Data file paths
const dataPath = path.join(__dirname, '../data/verifications.json');
const logsPath = path.join(__dirname, '../data/logs.json');

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

// Load or create logs
function loadLogs() {
  if (!fs.existsSync(logsPath)) {
    fs.writeFileSync(logsPath, JSON.stringify({ logs: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(logsPath, 'utf-8'));
}

// Save logs
function saveLogs(logs) {
  fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));
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

    const roleNames = {
      '1430101502244163644': 'Sword',
      '1430101478240157696': 'Grinder',
      '1430101478231773266': 'Crystal'
    };

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

      // Log the action
      const logs = loadLogs();
      logs.logs.push({
        timestamp: new Date().toISOString(),
        verifierId: verifierId,
        verifierTag: interaction.user.tag,
        userId: userId,
        userTag: targetUser.tag,
        roleId: choiceRoleId,
        roleName: roleNames[choiceRoleId],
        guildId: interaction.guild.id,
        guildName: interaction.guild.name
      });
      saveLogs(logs);

      // Post log to logs channel
      try {
        const logsChannel = await client.channels.fetch(LOGS_CHANNEL_ID);
        if (logsChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📋 Verification Log')
            .addFields(
              { name: 'Verifier', value: `<@${verifierId}> (${interaction.user.tag})`, inline: true },
              { name: 'User Verified', value: `<@${userId}> (${targetUser.tag})`, inline: true },
              { name: 'Role Given', value: roleNames[choiceRoleId], inline: true },
              { name: 'Guild', value: interaction.guild.name, inline: true },
              { name: 'Time', value: new Date().toLocaleString(), inline: true }
            )
            .setTimestamp();
          await logsChannel.send({ embeds: [logEmbed] });
        }
      } catch (logError) {
        console.error('Error posting to logs channel:', logError);
      }

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
