const MatchResult = require('../models/MatchResult');
const Goal = require('../models/Goal');
const Team = require('../models/Team');
const Player = require('../models/Player');
const generateMinute = require('./generateMinute');
const Fixture = require('../models/Fixture');

/**
 * Assigns goals to players based on weighted probability and saves them.
 *
 * @param {Array} players - Team players.
 * @param {Number} goals - Number of goals to assign.
 * @param {Object} match - MatchResult object.
 * @param {Object} season - Season object.
 * @returns {Array} - Array of scorer IDs.
 */
const assignGoals = async (players, goals, match, season) => {
  if (!players || players.length === 0) {
    console.error('Error: No players available for scoring.');
    return [];
  }

  const weightedPlayers = [];
  players.forEach((player) => {
    const weight = Math.ceil(player.attack / 10);
    for (let i = 0; i < weight; i++) {
      weightedPlayers.push(player);
    }
  });

  if (weightedPlayers.length === 0) {
    console.error('Error: No eligible players in the weighted array.');
    return [];
  }

  const scorers = [];
  for (let i = 0; i < goals; i++) {
    const randomIndex = Math.floor(Math.random() * weightedPlayers.length);
    let scorer = weightedPlayers[randomIndex];
    scorer = await Player.findById(scorer._id).populate('team');

    if (!scorer || !scorer.team) {
      console.error(`Error: Scorer ${scorer?.name || 'Unknown'} does not have a valid team.`);
      continue;
    }

    scorers.push(scorer._id);
    await saveGoal(scorer, scorer.team, match._id, season);
  }

  return scorers;
};

/**
 * Saves a goal and updates the MatchResult.
 *
 * @param {Object} player - Player scoring the goal.
 * @param {Object} team - Team scoring the goal.
 * @param {Object} matchId - MatchResult ID.
 * @param {Object} season - Season object.
 */
const saveGoal = async (player, team, matchId, season) => {
  try {
    if (!player || !player._id || !team || !team._id) {
      throw new Error('Invalid player or team data provided.');
    }

    let matchResult = await MatchResult.findById(matchId)
      .populate('match.homeTeam')
      .populate('match.awayTeam');

    if (!matchResult) {
      console.log('Creating new MatchResult record...');
      const otherTeam = await Team.findOne({ _id: { $ne: team._id } });
      if (!otherTeam) {
        throw new Error('Other team information is missing.');
      }

      matchResult = new MatchResult({
        season: season._id,
        match: {
          homeTeam: team._id,
          awayTeam: otherTeam._id,
        },
        homeScore: 0,
        awayScore: 0,
        matchDate: new Date(),
      });

      await matchResult.save();
      console.log(`MatchResult created: ${team.name} vs ${otherTeam.name}`);
    }

    const minute = generateMinute();

    const goal = new Goal({
      player: player._id,
      playerName: player.name,
      team: team._id,
      teamName: team.name,
      match: matchResult._id,
      season: season._id,
      seasonNumber: season.seasonNumber,
      week: matchResult.week || 1,
      minute,
    });

    await goal.save();
    console.log(`Goal saved: Player: ${player.name}, Team: ${team.name}, Match ID: ${matchResult._id}, Minute: ${minute}`);

    // Fixture'daki goals alanını güncelle
    await Fixture.updateOne(
      { 'matches._id': matchId },
      {
        $push: {
          'matches.$.goals': {
            player: player._id,
            playerName: player.name,
            team: team._id,
            teamName: team.name,
            minute,
          },
        },
      }
    );
    console.log(`Goal added to fixture: Match ID: ${matchId}, Minute: ${minute}`);
  } catch (error) {
    console.error('Error saving goal:', error.message, {
      // player,
      // team,
      // matchId,
      // season,
    });
    throw new Error('Failed to save goal');
  }
};

module.exports = { saveGoal, assignGoals };