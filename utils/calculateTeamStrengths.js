const Team = require('../models/Team');
const Player = require('../models/Player');

/**
 * Calculate the contribution of a player based on their stats, position, and factors.
 * @param {Object} player - The player object.
 * @returns {Object} - Attack and defense contributions of the player.
 */
const calculatePlayerContribution = (player) => {
  const contributionFactor = (player.condition / 100) * (player.form / 10);
  let attack = 0;
  let defense = 0;

  switch (player.position) {
    case 'Goalkeeper':
      defense += player.goalkeeper * contributionFactor;
      break;
    case 'Defence':
      defense += player.defense * 1.2 * contributionFactor;
      attack += player.attack * 0.2 * contributionFactor;
      break;
    case 'Midfield':
      attack += player.attack * 1 * contributionFactor;
      defense += player.defense * 1 * contributionFactor;
      break;
    case 'Forward':
      attack += player.attack * 1.5 * contributionFactor;
      defense += player.defense * 0.1 * contributionFactor;
      break;
    default:
      console.warn(`Unknown position for player ${player.name}`);
      break;
  }

  return { attack, defense };
};

/**
 * Calculate and return team strengths based on their first eleven players.
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

    const teamStrengths = [];

    for (const team of teams) {
      const firstEleven = team.playersInFirstEleven;

      if (!firstEleven.length) {
        console.log(`No first eleven players found for team ${team.name}.`);
        continue;
      }

      let totalAttackPower = 0;
      let totalDefensePower = 0;

      firstEleven.forEach((player) => {
        const { attack, defense } = calculatePlayerContribution(player);
        totalAttackPower += attack;
        totalDefensePower += defense;
      });

      // Scale power levels for realism
      const scaledAttackPower = totalAttackPower / firstEleven.length;
      const scaledDefensePower = totalDefensePower / firstEleven.length;

      // Update the team's calculated strengths in the database
      await Team.findByIdAndUpdate(team._id, {
        attackStrength: Math.round(scaledAttackPower),
        defenseStrength: Math.round(scaledDefensePower),
      });

      // Add the team's strengths to the results
      teamStrengths.push({
        teamName: team.name,
        attackStrength: Math.round(scaledAttackPower),
        defenseStrength: Math.round(scaledDefensePower),
      });
    }

    console.log('All team strengths calculated successfully.');
    return teamStrengths;
  } catch (error) {
    console.error('Error calculating team strengths:', error.message);
    throw error;
  }
};

module.exports = calculateTeamStrength;