const Player = require('../models/Player');
const Standing = require('../models/Standing');

/**
 * Calculates and logs the season's top scorer and other statistics.
 *
 * @param {Object} season - The active season object.
 */
const calculateSeasonStats = async (season) => {
  try {
    console.log(`Calculating statistics for Season ${season.seasonNumber}...`);

    // Find the top scorers
    const topScorers = await Player.find()
      .sort({ goals: -1 })
      .limit(25)
      .select('name goals team')
      .populate('team', 'name');

    if (topScorers.length > 0) {
      console.log(`Season ${season.seasonNumber} Top Scorers:`);
      topScorers.forEach((scorer, index) => {
        console.log(
          `${index + 1}. ${scorer.name} (${scorer.team?.name || 'Unknown Team'}) - ${scorer.goals} goals`
        );
      });
    } else {
      console.log(`No top scorers found for Season ${season.seasonNumber}.`);
    }

    // Find the team with the least goals conceded
    const standings = await Standing.find({ season: season._id })
      .sort({ goalsAgainst: 1 }) // Sort by least goals against
      .limit(1)
      .populate('team', 'name');

    if (standings.length > 0) {
      console.log(
        `Least Goals Conceded: ${standings[0].team?.name || 'Unknown Team'} - ${standings[0].goalsAgainst} goals`
      );
    } else {
      console.log(`No standings found for Season ${season.seasonNumber}.`);
    }

    console.log(`Statistics for Season ${season.seasonNumber} calculated successfully.`);
  } catch (error) {
    console.error(`Error calculating statistics for Season ${season.seasonNumber}:`, error.message);
    throw new Error('Failed to calculate season statistics.');
  }
};

module.exports = calculateSeasonStats;