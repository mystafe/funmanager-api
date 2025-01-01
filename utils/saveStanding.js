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

    // Find or create standings for the home team
    const homeStanding = await Standing.findOneAndUpdate(
      { team: homeTeam._id, season: season._id },
      {
        $setOnInsert: { team: homeTeam._id, season: season._id },
        $inc: { played: 1, goalsFor: homeGoals, goalsAgainst: awayGoals },
      },
      { new: true, upsert: true }
    );

    // Find or create standings for the away team
    const awayStanding = await Standing.findOneAndUpdate(
      { team: awayTeam._id, season: season._id },
      {
        $setOnInsert: { team: awayTeam._id, season: season._id },
        $inc: { played: 1, goalsFor: awayGoals, goalsAgainst: homeGoals },
      },
      { new: true, upsert: true }
    );

    // Determine match result and update points and results
    if (homeGoals > awayGoals) {
      await Standing.updateOne({ _id: homeStanding._id }, { $inc: { wins: 1, points: 3 } });
      await Standing.updateOne({ _id: awayStanding._id }, { $inc: { losses: 1 } });
    } else if (homeGoals < awayGoals) {
      await Standing.updateOne({ _id: awayStanding._id }, { $inc: { wins: 1, points: 3 } });
      await Standing.updateOne({ _id: homeStanding._id }, { $inc: { losses: 1 } });
    } else {
      await Standing.updateOne({ _id: homeStanding._id }, { $inc: { draws: 1, points: 1 } });
      await Standing.updateOne({ _id: awayStanding._id }, { $inc: { draws: 1, points: 1 } });
    }

    // Calculate goal differences
    await Standing.updateOne(
      { _id: homeStanding._id },
      { $set: { goalDifference: homeStanding.goalsFor - homeStanding.goalsAgainst } }
    );
    await Standing.updateOne(
      { _id: awayStanding._id },
      { $set: { goalDifference: awayStanding.goalsFor - awayStanding.goalsAgainst } }
    );

    console.log(`Standings updated for ${homeTeam.name} and ${awayTeam.name}`);
  } catch (error) {
    console.error('Error updating standings:', error.message);
    throw new Error('Failed to update standings.');
  }
};

module.exports = saveStanding;