// utils/calculateTeamStrength.js

const Team = require('../models/Team');
const calculatePlayerContribution = require('./calculatePlayerContribution');

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