const Goal = require('../models/Goal');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Fixture = require('../models/Fixture');
const generateMinutes = require('../utils/generateMinutes');
const saveGoal = require('../utils/saveGoal');

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
  try {
    // Validate players array
    if (!players || players.length === 0) {
      throw new Error('No players available for scoring.');
    }

    // Validate goals count
    if (goals <= 0) {
      console.warn('No goals to assign.');
      return [];
    }

    // Fetch all player details
    const playerData = await Player.find({ _id: { $in: players.map((p) => p._id) } }).populate('team', 'name');
    if (!playerData.length) {
      throw new Error('No valid players found for scoring.');
    }

    // Build weighted array for player selection
    const weightedPlayers = [];
    playerData.forEach((player) => {
      const weight = Math.max(1, Math.ceil((player.attack || 0) / 10)); // Ensure a minimum weight of 1
      for (let i = 0; i < weight; i++) {
        weightedPlayers.push(player);
      }
    });

    if (weightedPlayers.length === 0) {
      throw new Error('No eligible players in the weighted array.');
    }

    // Generate unique and sorted goal minutes
    const minutes = generateMinutes(goals);

    // Assign goals and save them
    const scorers = await Promise.all(
      minutes.map(async (minute) => {
        try {
          const randomIndex = Math.floor(Math.random() * weightedPlayers.length);
          const scorer = weightedPlayers[randomIndex];

          if (!scorer || !scorer.team) {
            console.error(`Error: Scorer ${scorer?.name || 'Unknown'} does not have a valid team.`);
            return null; // Skip invalid scorer
          }

          await saveGoal(scorer._id, scorer.team._id, match._id, season, minute, match.week || 1);
          return scorer._id;
        } catch (error) {
          console.error(`Failed to save goal for minute ${minute}:`, error.message);
          return null;
        }
      })
    );

    // Filter out null values (invalid scorers)
    const validScorers = scorers.filter(Boolean);
    if (validScorers.length === 0) {
      console.warn('No valid scorers were assigned.');
    }

    return validScorers;
  } catch (error) {
    console.error('Error assigning goals:', error.message);
    throw new Error('Failed to assign goals.');
  }
};

module.exports = assignGoals;