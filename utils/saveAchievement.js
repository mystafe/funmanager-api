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
    // Fetch the fixture for the season
    const fixture = await Fixture.findOne({ season: season._id });
    if (!fixture || !fixture.matches.length) {
      throw new Error(`No matches found for season ${season.seasonNumber}`);
    }

    console.log(`Processing fixtures for season ${season.seasonNumber}`);

    // Aggregate scorer data from matches.goals
    const scorerMap = {};
    fixture.matches.forEach((match) => {
      if (match.goals && match.goals.length > 0) {
        match.goals.forEach((goal) => {
          const scorerId = goal.player.toString();
          scorerMap[scorerId] = (scorerMap[scorerId] || 0) + 1;
        });
      }
    });

    // Debug: Log scorer map
    console.log('Scorer Map:', scorerMap);

    // Determine top scorers
    const topScorers = Object.entries(scorerMap)
      .map(([playerId, goals]) => ({ playerId, goals }))
      .sort((a, b) => b.goals - a.goals);

    if (!topScorers.length) {
      console.warn(`No top scorers found for season ${season.seasonNumber}`);
    }

    // Enrich top scorer data with player and team information
    const enrichedTopScorers = await Promise.all(
      topScorers.slice(0, 25).map(async ({ playerId, goals }) => {
        const player = await Player.findById(playerId).populate('team', 'name');
        if (!player) {
          console.warn(`Player with ID ${playerId} not found.`);
          return {
            player: playerId,
            playerName: 'Unknown Player',
            teamName: 'Unknown Team',
            goals,
          };
        }
        return {
          player: playerId,
          playerName: player.name,
          teamName: player.team?.name || 'Unknown Team',
          goals,
        };
      })
    );

    // Debug: Log enriched top scorers
    console.log('Enriched Top Scorers:', enrichedTopScorers);

    // Determine the champion
    const standings = await Standing.find({ season: season._id })
      .sort({ points: -1, goalDifference: -1, goalsFor: -1 })
      .populate('team', 'name');

    const champion = standings.length ? standings[0].team : null;

    // Debug: Log champion
    if (champion) {
      console.log(`Champion for season ${season.seasonNumber}: ${champion.name}`);
    } else {
      console.warn(`No champion determined for season ${season.seasonNumber}`);
    }

    // Save achievement data
    const achievement = await Achievement.findOneAndUpdate(
      { season: season._id },
      {
        $set: {
          season: season._id,
          seasonNumber: season.seasonNumber,
          champion: champion?._id || null,
          topScorers: enrichedTopScorers,
        },
      },
      { upsert: true, new: true }
    );

    console.log(`Achievements saved for season ${season.seasonNumber}`, achievement);
  } catch (error) {
    console.error('Error saving achievements:', error.message);
    throw new Error('Failed to save achievements.');
  }
};

module.exports = saveAchievement;