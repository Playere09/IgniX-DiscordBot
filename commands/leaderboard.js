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
    .setDescription('Show the recruit leaderboard with verification stats')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('What to view')
        .setRequired(false)
        .addChoices(
          { name: 'Top Recruits', value: 'recruits' },
          { name: 'Verifier Stats', value: 'verifiers' }
        )
    ),

  async execute(interaction, client) {
    try {
      const data = loadData();
      const type = interaction.options.getString('type') || 'recruits';

      if (type === 'recruits') {
        // Sort by verification count
        const sorted = Object.entries(data.verifications)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 10);

        if (sorted.length === 0) {
          return interaction.reply({
            content: '📊 No recruits found yet!',
            ephemeral: true
          });
        }

        let leaderboardText = '';
        sorted.forEach((entry, index) => {
          const [userId, userData] = entry;
          leaderboardText += `**${index + 1}.** <@${userId}> - **${userData.count}** verifications\n`;
        });

        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('🏆 Recruit Leaderboard')
          .setDescription(leaderboardText)
          .setFooter({ text: 'Most verified users' })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });

      } else if (type === 'verifiers') {
        // Count by verifier
        const verifierStats = {};
        
        Object.values(data.verifications).forEach(userData => {
          userData.verifiedBy.forEach(verification => {
            if (!verifierStats[verification.verifierId]) {
              verifierStats[verification.verifierId] = 0;
            }
            verifierStats[verification.verifierId] += 1;
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
          .setTitle('🏆 Verifier Stats')
          .setDescription(leaderboardText)
          .setFooter({ text: 'Most active verifiers' })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Error in leaderboard command:', error);
      await interaction.reply({
        content: '❌ An error occurred while loading the leaderboard!',
        ephemeral: true
      });
    }
  }
};
