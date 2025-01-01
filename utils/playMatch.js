const Team = require('../models/Team');
const Fixture = require('../models/Fixture');
const saveStanding = require('./saveStanding');
const saveAchievement = require('../utils/saveAchievement');
const assignGoals = require('./assignGoals');
/**
 * Plays a single match, calculates scores, updates standings, and records achievements.
 *
 * @param {Object} match - The match object from the fixture.
 * @param {Object} season - The active season object.
 * @returns {Object} - The result of the played match.
 */
const playMatch = async (match, season) => {
  try {
    const homeTeam = await Team.findById(match.homeTeam).populate('players');
    const awayTeam = await Team.findById(match.awayTeam).populate('players');

    if (!homeTeam || !awayTeam) {
      throw new Error('Invalid team data for the match.');
    }

    const homeAttack = homeTeam.attackStrength || 1; // Minimum 1
    const awayAttack = awayTeam.attackStrength || 1;
    const homeDefense = homeTeam.defenseStrength || 1;
    const awayDefense = awayTeam.defenseStrength || 1;

    // Generate match scores based on team strengths
    const homeChance = Math.max(0.1, homeAttack / awayDefense + 0.25); // Home advantage
    const awayChance = Math.max(0.1, awayAttack / homeDefense);
    const homeScore = Math.floor(homeChance * Math.random() * 5);
    const awayScore = Math.floor(awayChance * Math.random() * 5);

    // Assign scorers
    const homeScorers = await assignGoals(homeTeam.players, homeScore, match, season);
    const awayScorers = await assignGoals(awayTeam.players, awayScore, match, season);

    // Update fixture match details
    await Fixture.updateOne(
      { 'matches._id': match._id },
      {
        $set: {
          'matches.$.homeScore': homeScore,
          'matches.$.awayScore': awayScore,
          'matches.$.homeScorers': homeScorers,
          'matches.$.awayScorers': awayScorers,
        },
      }
    );

    // Update standings
    await saveStanding({ homeTeam, awayTeam, homeScore, awayScore }, season);

    // Save achievements if there are scorers
    if (homeScorers.length > 0) await saveAchievement(homeScorers, match, season);
    if (awayScorers.length > 0) await saveAchievement(awayScorers, match, season);

    return {
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
    throw new Error('Failed to play match.');
  }
};

module.exports = playMatch;