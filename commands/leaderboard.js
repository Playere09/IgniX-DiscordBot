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
    .setName('leaderboard')
    .setDescription('Show the Recruiter Leaderboard (most active verifiers)')
    ,

  async execute(interaction, client) {
    try {
      const data = loadData();

      // Count unique users verified by each verifier (recruiter)
      // For each verified user, collect the set of verifiers who verified them,
      // then increment each verifier's unique-user count by 1.
      const verifierStats = {};
      Object.entries(data.verifications).forEach(([userId, userData]) => {
        const uniqueVerifiers = new Set((userData.verifiedBy || []).map(v => v.verifierId));
        uniqueVerifiers.forEach(verifierId => {
          verifierStats[verifierId] = (verifierStats[verifierId] || 0) + 1;
        });
      });

      const sorted = Object.entries(verifierStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      if (sorted.length === 0) {
        return interaction.reply({
          content: '📊 No verifications yet!',
          ephemeral: true
        });
      }

      let leaderboardText = '';
      sorted.forEach((entry, index) => {
        const [verifierId, count] = entry;
        leaderboardText += `**${index + 1}.** <@${verifierId}> - **${count}** verifications\n`;
      });

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🏆 Recruiter Leaderboard (unique users verified)')
        .setDescription(leaderboardText)
        .setFooter({ text: 'Most active recruiters' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in leaderboard command:', error);
      await interaction.reply({
        content: '❌ An error occurred while loading the leaderboard!',
        ephemeral: true
      });
    }
  }
};
