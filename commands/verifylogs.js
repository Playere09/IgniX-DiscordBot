const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const logsPath = path.join(__dirname, '../data/logs.json');

function loadLogs() {
  if (!fs.existsSync(logsPath)) {
    return { logs: [] };
  }
  return JSON.parse(fs.readFileSync(logsPath, 'utf-8'));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifylogs')
    .setDescription('View verification logs')
    .addIntegerOption(option =>
      option
        .setName('limit')
        .setDescription('Number of recent logs to show (default 10)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(50)
    ),

  async execute(interaction, client) {
    try {
      const limit = interaction.options.getInteger('limit') || 10;
      const logs = loadLogs();

      if (logs.logs.length === 0) {
        return interaction.reply({
          content: '📋 No verification logs yet!',
          ephemeral: true
        });
      }

      // Get the most recent logs
      const recentLogs = logs.logs.slice(-limit).reverse();

      let logsText = '';
      recentLogs.forEach((log, index) => {
        const date = new Date(log.timestamp);
        const timeStr = date.toLocaleString();
        logsText += `**${index + 1}.** <@${log.verifierId}> verified <@${log.userId}> with **${log.roleName}**\n`;
        logsText += `├─ Time: ${timeStr}\n`;
        logsText += `└─ Guild: ${log.guildName}\n\n`;
      });

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('📋 Verification Logs')
        .setDescription(logsText)
        .setFooter({ text: `Showing last ${Math.min(limit, logs.logs.length)} of ${logs.logs.length} verifications` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in verifylogs command:', error);
      await interaction.reply({
        content: '❌ An error occurred while loading logs!',
        ephemeral: true
      });
    }
  }
};
