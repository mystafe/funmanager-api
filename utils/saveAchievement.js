const Achievement = require('../models/Achievement');
const Player = require('../models/Player');

/**
 * Updates player achievements for a given match result.
 *
 * @param {Array} scorers - Array of goal scorer IDs.
 * @param {Object} match - The match object containing scores and team info.
 * @param {Object} season - The active season object.
 */
const saveAchievement = async (scorers, match, season) => {
  try {
    // Ensure scorers array is not empty
    if (!scorers || scorers.length === 0) {
      console.log('No scorers provided for achievements.');
      return;
    }

    for (const scorerId of scorers) {
      const player = await Player.findById(scorerId);
      if (!player) {
        console.error(`Player with ID ${scorerId} not found. Skipping.`);
        continue;
      }

      // Use atomic update with $set and $push
      await Achievement.findOneAndUpdate(
        { season: season._id, 'topScorers.player': { $ne: scorerId } },
        {
          $push: {
            topScorers: {
              player: player._id,
              playerName: player.name,
              goals: 1,
            },
          },
        },
        { new: true, upsert: true }
      );

      // Increment goals if scorer already exists
      await Achievement.updateOne(
        { season: season._id, 'topScorers.player': scorerId },
        { $inc: { 'topScorers.$.goals': 1 } }
      );
    }

    console.log(
      `Achievements saved for match ${match.homeTeam?.name || 'Unknown'} vs ${match.awayTeam?.name || 'Unknown'
      }.`
    );
  } catch (error) {
    console.error('Error saving achievements:', {
      error: error.message,
      scorers,
      match,
      season,
    });
    throw new Error('Failed to save achievements.');
  }
};

module.exports = saveAchievement;