const Team = require('../models/Team');
const Player = require('../models/Player');

const calculateTeamPower = async () => {
  try {
    const teams = await Team.find();

    for (const team of teams) {
      const players = await Player.find({ team: team._id });

      // En iyi 6 defans oyuncusunu seç
      const topDefenders = players
        .sort((a, b) => b.defense - a.defense)
        .slice(0, 6)
        .reduce((sum, player) => sum + player.defense, 0);

      // En iyi 5 atak oyuncusunu seç
      const topAttackers = players
        .sort((a, b) => b.attack - a.attack)
        .slice(0, 5)
        .reduce((sum, player) => sum + player.attack, 0);

      const remainingDefense = players
        .slice(6)
        .reduce((sum, player) => sum + player.defense, 0);

      const remainingAttack = players
        .slice(5)
        .reduce((sum, player) => sum + player.attack, 0);

      // Takım güçlerini hesapla
      const defenseStrength = topDefenders * 3 + remainingDefense;
      const attackStrength = topAttackers * 3.5 + remainingAttack;

      // Takım güçlerini güncelle
      await Team.findByIdAndUpdate(team._id, {
        defenseStrength,
        attackStrength,
      });

      console.log(`Strengths updated for team: ${team.name}`);
    }

    console.log('All team strengths calculated successfully.');
  } catch (error) {
    console.error('Error calculating team strengths:', error.message);
  }
};

module.exports = calculateTeamPower;