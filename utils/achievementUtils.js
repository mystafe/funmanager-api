const Achievement = require('../models/Achievement');
const Standing = require('../models/Standing');

const saveAchievements = async (season) => {
  try {
    // Şampiyon takımı belirle
    const standings = await Standing.find({ season: season._id })
      .populate('team', 'name')
      .sort({ points: -1, goalDifference: -1 });

    if (!standings || standings.length === 0) {
      console.error(`No standings found for season ${season.seasonNumber}`);
      return;
    }

    const champion = standings[0];
    const topScorer = await Player.find() // Oyuncu modeli import edilmeli
      .populate('team', 'name')
      .lean()
      .sort((a, b) => b.goals.length - a.goals.length)[0];

    const achievement = new Achievement({
      season: season._id,
      seasonNumber: season.seasonNumber,
      champion: {
        teamId: champion.team._id,
        teamName: champion.team.name,
      },
      topScorer: {
        playerId: topScorer._id,
        playerName: topScorer.name,
        teamId: topScorer.team._id,
        teamName: topScorer.team.name,
        totalGoals: topScorer.goals.length,
      },
    });

    await achievement.save();
    console.log(`Achievements saved for season ${season.seasonNumber}`);
  } catch (error) {
    console.error('Error saving achievements:', error.message);
    throw new Error('Failed to save achievements.');
  }
};

module.exports = { saveAchievements };