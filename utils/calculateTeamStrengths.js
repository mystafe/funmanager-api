const Team = require('../models/Team');
const Player = require('../models/Player');

/**
 * Calculate the contribution of a player based on their stats and position.
 * @param {Object} player - The player object.
 * @returns {Object} - Attack and defense contributions of the player.
 */
const calculatePlayerContribution = (player) => {
  const conditionFactor = (player.condition / 100) * (player.form / 10);
  const attackWeights = { Goalkeeper: 0, Defence: 0.2, Midfield: 1, Forward: 1.5 };
  const defenseWeights = { Goalkeeper: 1.5, Defence: 1.2, Midfield: 1, Forward: 0.1 };

  const attack = (player.attack || 0) * (attackWeights[player.position] || 0) * conditionFactor;
  const defense = (player.defense || 0) * (defenseWeights[player.position] || 0) * conditionFactor;

  return { attack, defense };
};

/**
 * Calculate and update team strengths based on their first eleven players.
 * @returns {Array} - Array of team strengths including attack and defense strengths.
 */
const calculateTeamStrength = async () => {
  try {
    const teams = await Team.find().populate({
      path: 'playersInFirstEleven',
      select: 'name position attack defense goalkeeper condition form',
    });

    if (!teams.length) {
      console.log('No teams found in the database.');
      return [];
    }

    const teamStrengths = teams.map((team) => {
      const firstEleven = team.playersInFirstEleven;

      if (!firstEleven || !firstEleven.length) {
        console.warn(`No first eleven players found for team ${team.name}.`);
        return { teamName: team.name, attackStrength: 0, defenseStrength: 0 };
      }

      const totalStrength = firstEleven.reduce(
        (totals, player) => {
          const { attack, defense } = calculatePlayerContribution(player);
          totals.attack += attack;
          totals.defense += defense;
          return totals;
        },
        { attack: 0, defense: 0 }
      );

      const attackStrength = Math.round(totalStrength.attack / firstEleven.length);
      const defenseStrength = Math.round(totalStrength.defense / firstEleven.length);

      // Update the team's calculated strengths in the database
      team.attackStrength = attackStrength;
      team.defenseStrength = defenseStrength;
      team.save();

      return {
        teamName: team.name,
        attackStrength,
        defenseStrength,
      };
    });

    console.log('All team strengths calculated successfully.');
    return teamStrengths;
  } catch (error) {
    console.error('Error calculating team strengths:', error.message);
    throw error;
  }
};

module.exports = calculateTeamStrength;