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
  try {
    // Validate inputs
    if (!playerId || !teamId || !matchId || !season || !minute) {
      throw new Error('Missing required parameters.');
    }

    // Fetch player and team details in parallel
    const [player, team] = await Promise.all([
      Player.findById(playerId).select('name'),
      Team.findById(teamId).select('name'),
    ]);

    // Validate fetched player and team
    if (!player || !team) {
      throw new Error(`Player or team not found: playerId=${playerId}, teamId=${teamId}`);
    }

    // Ensure the season contains a valid seasonNumber
    if (!season.seasonNumber) {
      throw new Error('Invalid season data: seasonNumber is required.');
    }

    // Create and save the goal
    const goal = await Goal.create({
      player: player._id,
      playerName: player.name,
      team: team._id,
      teamName: team.name,
      match: matchId,
      season: season._id,
      seasonNumber: season.seasonNumber,
      week: week || 1,
      minute,
    });

    console.log(`Goal saved successfully: Player=${player.name}, Team=${team.name}, Minute=${minute}`);

    // Update the corresponding match in Fixture
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
      console.warn(`Fixture update failed for match ID: ${matchId}`);
    } else {
      console.log(`Fixture updated successfully for match ID: ${matchId}`);
    }
  } catch (error) {
    console.error('Error saving goal:', error.message, {
      playerId,
      teamId,
      matchId,
      seasonId: season._id,
      minute,
      week,
    });
    throw new Error('Failed to save goal');
  }
};

module.exports = saveGoal;