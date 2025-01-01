const Team = require('../models/Team');
const Fixture = require('../models/Fixture');
const saveStanding = require('./saveStanding');
const checkAndFinalizeSeason = require('./checkAndFinalizeSeason');
const assignGoals = require('./assignGoals');

/**
 * Plays a single match, calculates scores, and updates standings.
 *
 * @param {Object} match - The match object from the fixture.
 * @param {Object} season - The active season object.
 * @returns {Object} - The result of the played match.
 */
const playMatch = async (match, season) => {
  try {
    const homeTeam = await Team.findById(match.homeTeam).populate('players');
    const awayTeam = await Team.findById(match.awayTeam).populate('players');

    if (!homeTeam) {
      throw new Error(`Home team with ID ${match.homeTeam} not found.`);
    }
    if (!awayTeam) {
      throw new Error(`Away team with ID ${match.awayTeam} not found.`);
    }

    const homeAttack = homeTeam.attackStrength || 1;
    const awayAttack = awayTeam.attackStrength || 1;
    const homeDefense = homeTeam.defenseStrength || 1;
    const awayDefense = awayTeam.defenseStrength || 1;

    // Generate match scores based on team strengths
    const homeChance = Math.max(0.1, homeAttack / awayDefense + 0.25);
    const awayChance = Math.max(0.1, awayAttack / homeDefense);
    const homeScore = Math.floor(homeChance * Math.random() * 5);
    const awayScore = Math.floor(awayChance * Math.random() * 5);

    // Assign scorers
    const homeScorers = await assignGoals(homeTeam.players, homeScore, match, season);
    const awayScorers = await assignGoals(awayTeam.players, awayScore, match, season);

    if (!Array.isArray(homeScorers) || !Array.isArray(awayScorers)) {
      throw new Error('Invalid scorer data returned by assignGoals.');
    }

    // Update fixture match details
    const updatedFixture = await Fixture.updateOne(
      { 'matches._id': match._id },
      {
        $set: {
          'matches.$.homeScore': homeScore,
          'matches.$.awayScore': awayScore,
          ...(homeScorers.length > 0 && { 'matches.$.homeScorers': homeScorers }),
          ...(awayScorers.length > 0 && { 'matches.$.awayScorers': awayScorers }),
        },
      }
    );
    if (!updatedFixture.modifiedCount) {
      throw new Error('Failed to update match details in Fixture.');
    }

    // Update standings
    await saveStanding({ homeTeam, awayTeam, homeScore, awayScore }, season);

    // Check if the season is complete
    await checkAndFinalizeSeason(season);

    return {
      success: true,
      matchId: match._id,
      homeTeam: homeTeam.name,
      awayTeam: awayTeam.name,
      homeScore,
      awayScore,
      homeScorers,
      awayScorers,
    };
  } catch (error) {
    console.error(`Error playing match ${match._id}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = playMatch;