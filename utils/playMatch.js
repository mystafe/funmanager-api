const Team = require('../models/Team');
const Fixture = require('../models/Fixture');
const { assignGoals } = require('./goalUtils');
const saveStanding = require('./saveStanding');
const saveAchievement = require('./saveAchievement');

/**
 * Plays a single match, calculates scores, updates standings, and records achievements.
 *
 * @param {Object} match - The match object from the fixture.
 * @param {Object} season - The active season object.
 * @returns {Object} - The result of the played match.
 */
const playMatch = async (match, season) => {
  try {
    // Fetch home and away teams along with players
    const homeTeam = await Team.findById(match.homeTeam).populate('players');
    const awayTeam = await Team.findById(match.awayTeam).populate('players');

    if (!homeTeam || !awayTeam) {
      throw new Error('Invalid team data for the match.');
    }

    // Calculate team strengths
    const homeAttack = homeTeam.attackStrength || 0;
    const awayAttack = awayTeam.attackStrength || 0;
    const homeDefense = homeTeam.defenseStrength || 0;
    const awayDefense = awayTeam.defenseStrength || 0;

    // Generate match scores based on team strengths
    const homeChance = homeAttack / (awayDefense + 1) + 0.25; // Home advantage
    const awayChance = awayAttack / (homeDefense + 1);
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

    // Update achievements for scorers
    await saveAchievement(homeScorers, match, season);
    await saveAchievement(awayScorers, match, season);

    // Return match result details
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