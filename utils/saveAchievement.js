const Achievement = require('../models/Achievement');
const Fixture = require('../models/Fixture');
const Standing = require('../models/Standing');
const Player = require('../models/Player');

/**
 * Saves achievements for a completed season, including top scorers and the champion.
 *
 * @param {Object} season - The completed season object.
 */
const saveAchievement = async (season) => {
  try {
    // O sezonun fikstürünü al
    const fixture = await Fixture.findOne({ season: season._id });

    if (!fixture || !fixture.matches.length) {
      throw new Error(`No matches found for season ${season.seasonNumber}`);
    }

    // Gol atan oyuncuları topla
    const scorerMap = {};
    fixture.matches.forEach((match) => {
      const allScorers = [...(match.homeScorers || []), ...(match.awayScorers || [])];
      allScorers.forEach((scorerId) => {
        scorerMap[scorerId] = (scorerMap[scorerId] || 0) + 1;
      });
    });

    // Gol krallarını belirle
    const topScorers = Object.entries(scorerMap)
      .map(([playerId, goals]) => ({ playerId, goals }))
      .sort((a, b) => b.goals - a.goals);

    const enrichedTopScorers = await Promise.all(
      topScorers.map(async ({ playerId, goals }) => {
        const player = await Player.findById(playerId).populate('team', 'name');
        return {
          player: playerId,
          playerName: player.name,
          teamName: player.team?.name || 'Unknown Team',
          goals,
        };
      })
    );

    // Şampiyonu belirle
    const standings = await Standing.find({ season: season._id })
      .sort({ points: -1, goalDifference: -1, goalsFor: -1 })
      .populate('team', 'name');

    const champion = standings.length ? standings[0].team : null;

    // Başarıyı kaydet
    await Achievement.findOneAndUpdate(
      { season: season._id },
      {
        $set: {
          season: season._id,
          seasonNumber: season.seasonNumber,
          champion: champion ? champion._id : null,
          championTeamName: champion ? champion.name : 'Unknown',
          topScorers: enrichedTopScorers,
        },
      },
      { upsert: true, new: true }
    );

    console.log(`Achievements saved for season ${season.seasonNumber}`);
  } catch (error) {
    console.error('Error saving achievements:', error.message);
    throw new Error('Failed to save achievements.');
  }
};

module.exports = saveAchievement;