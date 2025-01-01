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
    if (!scorers || scorers.length === 0) {
      console.log('No scorers provided for achievements.');
      return;
    }

    // Ensure Achievement exists for the season
    const achievement = await Achievement.findOneAndUpdate(
      { season: season._id },
      { $setOnInsert: { season: season._id, seasonNumber: season.seasonNumber, topScorers: [] } },
      { upsert: true, new: true }
    );

    if (!achievement) {
      throw new Error(`Failed to retrieve or create Achievement for season ${season.seasonNumber}`);
    }

    // Update scorers
    for (const scorerId of scorers) {
      const player = await Player.findById(scorerId).populate('team', 'name');
      if (!player) {
        console.error(`Player with ID ${scorerId} not found. Skipping.`);
        continue;
      }
      // Atomically update the player's goals
      await Achievement.updateOne(
        { season: season._id, 'topScorers.player': { $ne: scorerId } },
        {
          $push: {
            topScorers: {
              player: player._id,
              playerName: player.name,
              goals: 1,
            },
          },
        }
      );

      await Achievement.updateOne(
        { season: season._id, 'topScorers.player': scorerId },
        { $inc: { 'topScorers.$.goals': 1 } }
      );
    }
  } catch (error) {
    console.error('Error saving achievements:', error.message);
    throw new Error('Failed to save achievements.');
  }
};

module.exports = saveAchievement;