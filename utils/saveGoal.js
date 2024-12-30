const Fixture = require('../models/Fixture');
const Goal = require('../models/Goal');
const Player = require('../models/Player');
const Team = require('../models/Team');

/**
 * Saves a goal and updates the Fixture.
 *
 * @param {ObjectId} playerId - ID of the player scoring the goal.
 * @param {ObjectId} teamId - ID of the team scoring the goal.
 * @param {ObjectId} matchId - ID of the match where the goal was scored.
 * @param {Object} season - Season object containing season details.
 * @param {Number} minute - Minute when the goal was scored.
 * @param {Number} week - Week number of the match.
 */
const saveGoal = async (playerId, teamId, matchId, season, minute, week) => {

  console.log('saveGoal seasonNumber', season.seasonNumber);
  try {
    // Fetch player and team details
    const player = await Player.findById(playerId);
    const team = await Team.findById(teamId);

    // Validate player and team
    if (!player || !team) {
      console.error('Invalid player or team data:', { playerId, teamId });
      throw new Error('Player or team not found.');
    }

    // Ensure seasonNumber is available
    if (!season.seasonNumber) {
      console.error('Missing seasonNumber in season object:', season);
      throw new Error('Invalid season data: seasonNumber is required.');
    }

    // Create and save the goal
    const goal = new Goal({
      player: player._id,
      playerName: player.name,
      team: team._id,
      teamName: team.name,
      match: matchId,
      season: season._id,
      seasonNumber: season.seasonNumber, // Ensure this is correctly passed
      week: week || 1, // Default to week 1 if not provided
      minute,
    });

    await goal.save();
    console.log(`Goal saved: Player ${player.name}, Team ${team.name}, Minute ${minute}`);

    // Update Fixture with the goal details
    const fixtureUpdateResult = await Fixture.updateOne(
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

    if (fixtureUpdateResult.modifiedCount === 0) {
      console.warn('Fixture update failed for match ID:', matchId);
    }
  } catch (error) {
    console.error('Error saving goal:', error.message, { playerId, teamId, matchId, season, minute, week });
    throw new Error('Failed to save goal');
  }
};

module.exports = saveGoal;