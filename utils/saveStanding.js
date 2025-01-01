const Standing = require('../models/Standing');

/**
 * Updates the league standings for a given match result.
 *
 * @param {Object} match - The match object containing scores and team info.
 * @param {Object} season - The active season object.
 */
const saveStanding = async (match, season) => {
  try {
    const { homeTeam, awayTeam, homeScore, awayScore } = match;
    // Ensure scores are numbers for calculations
    const homeGoals = parseInt(homeScore, 10) || 0;
    const awayGoals = parseInt(awayScore, 10) || 0;

    // Update standings for the home team
    const homeStanding = await Standing.findOneAndUpdate(
      { team: homeTeam._id, season: season._id },
      { $inc: { played: 1, goalsFor: homeGoals, goalsAgainst: awayGoals } },
      { new: true, upsert: true }
    );

    // Update standings for the away team
    const awayStanding = await Standing.findOneAndUpdate(
      { team: awayTeam._id, season: season._id },
      { $inc: { played: 1, goalsFor: awayGoals, goalsAgainst: homeGoals } },
      { new: true, upsert: true }
    );

    // Determine match result and update points and results
    if (homeGoals > awayGoals) {
      // Home team wins
      homeStanding.wins += 1;
      homeStanding.points += 3;
      awayStanding.losses += 1;
    } else if (homeGoals < awayGoals) {
      // Away team wins
      awayStanding.wins += 1;
      awayStanding.points += 3;
      homeStanding.losses += 1;
    } else {
      // Match is a draw
      homeStanding.draws += 1;
      awayStanding.draws += 1;
      homeStanding.points += 1;
      awayStanding.points += 1;
    }

    // Calculate goal differences
    homeStanding.goalDifference = homeStanding.goalsFor - homeStanding.goalsAgainst;
    awayStanding.goalDifference = awayStanding.goalsFor - awayStanding.goalsAgainst;

    // Save updated standings
    await homeStanding.save();
    await awayStanding.save();
  } catch (error) {
    console.error('Error updating standings:', error.message);
    throw new Error('Failed to update standings.');
  }
};

module.exports = saveStanding;