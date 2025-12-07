const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/verifications.json');

function loadData() {
  if (!fs.existsSync(dataPath)) {
    return { verifications: {} };
  }
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifyinfo')
    .setDescription('Check who verified a user and their roles')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to check')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    try {
      const targetUser = interaction.options.getUser('user');
      const data = loadData();
      const userData = data.verifications[targetUser.id];

      if (!userData || userData.count === 0) {
        return interaction.reply({
          content: `❌ <@${targetUser.id}> has not been verified yet!`,
          ephemeral: true
        });
      }

      const roleNames = {
        '1430101502244163644': 'Sword',
        '1430101478240157696': 'Grinder',
        '1430101478231773266': 'Crystal'
      };

      let verifiedByText = '';
      userData.verifiedBy.forEach((verification, index) => {
        const date = new Date(verification.timestamp);
        verifiedByText += `**${index + 1}.** <@${verification.verifierId}> - ${date.toLocaleDateString()}\n`;
      });

      let rolesText = '';
      userData.roles.forEach((roleData, index) => {
        const date = new Date(roleData.timestamp);
        rolesText += `**${index + 1}.** ${roleNames[roleData.roleId] || 'Unknown'} - <@${roleData.verifierId}> (${date.toLocaleDateString()})\n`;
      });

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(`✅ Verification Info for ${targetUser.username}`)
        .addFields(
          { name: 'Total Verifications', value: `${userData.count}`, inline: true },
          { name: 'Verified By', value: verifiedByText || 'None', inline: false },
          { name: 'Roles Assigned', value: rolesText || 'None', inline: false }
        )
        .setThumbnail(targetUser.displayAvatarURL())
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in verifyinfo command:', error);
      await interaction.reply({
        content: '❌ An error occurred!',
        ephemeral: true
      });
    }
  }
};
