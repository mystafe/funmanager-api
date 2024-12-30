const Team = require('../models/Team');
const Player = require('../models/Player');

/**
 * Güncel tüm takımların ilk 11 oyuncularını taktiğe göre günceller.
 */
const updateFirstEleven = async () => {
  try {
    const tacticFormation = {
      '4-4-2': { Goalkeeper: 1, Defence: 4, Midfield: 4, Forward: 2 },
      '3-5-2': { Goalkeeper: 1, Defence: 3, Midfield: 5, Forward: 2 },
      '4-3-3': { Goalkeeper: 1, Defence: 4, Midfield: 3, Forward: 3 },
      '3-4-3': { Goalkeeper: 1, Defence: 3, Midfield: 4, Forward: 3 },
      '4-5-1': { Goalkeeper: 1, Defence: 4, Midfield: 5, Forward: 1 },
      '4-2-4': { Goalkeeper: 1, Defence: 4, Midfield: 2, Forward: 4 },
      '5-3-2': { Goalkeeper: 1, Defence: 5, Midfield: 3, Forward: 2 },
      '5-4-1': { Goalkeeper: 1, Defence: 5, Midfield: 4, Forward: 1 },
    };

    const teams = await Team.find().populate('players');

    for (const team of teams) {
      const formation = tacticFormation[team.defaultTactic];

      //show team name and default tactic
      console.log(`Team: ${team.name} - Tactic: ${team.defaultTactic}`);
      if (!formation) {
        console.warn(`Unknown tactic ${team.defaultTactic} for team ${team.name}. Skipping.`);
        continue;
      }

      // Oyuncuları pozisyona göre gruplandır
      const positionGroups = { Goalkeeper: [], Defence: [], Midfield: [], Forward: [] };
      for (const player of team.players) {
        positionGroups[player.position]?.push(player);
      }

      // Her pozisyondaki oyuncuları sıralayın
      for (const position in positionGroups) {
        positionGroups[position].sort((a, b) => {
          const strengthA = a.attack * 1.3 + a.defense * 1.2 + a.goalkeeper * 1.5;
          const strengthB = b.attack * 1.3 + b.defense * 1.2 + b.goalkeeper * 1.5;
          return strengthB - strengthA;
        });
      }

      // İlk 11 oyuncuları seçin
      const playersInFirstEleven = [];
      for (const [position, count] of Object.entries(formation)) {
        playersInFirstEleven.push(...positionGroups[position].slice(0, count));
      }

      // Kalan oyuncular arasından yedek oyuncuları seçin
      const remainingPlayers = Object.values(positionGroups)
        .flat()
        .filter((player) => !playersInFirstEleven.includes(player));
      const playersOnBench = remainingPlayers.slice(0, 7);

      // Veritabanında güncelleme
      await Player.updateMany(
        { _id: { $in: team.players } },
        { $set: { isFirstEleven: false, isMatchSquad: false } }
      );
      await Player.updateMany(
        { _id: { $in: playersInFirstEleven.map((p) => p._id) } },
        { $set: { isFirstEleven: true, isMatchSquad: true } }
      );
      await Player.updateMany(
        { _id: { $in: playersOnBench.map((p) => p._id) } },
        { $set: { isMatchSquad: true } }
      );

      // Takımı güncelleyin
      team.playersInFirstEleven = playersInFirstEleven.map((p) => p._id);
      team.playersOnBench = playersOnBench.map((p) => p._id);
      await team.save();

      console.log(`First eleven players updated for team ${team.name}.`);
    }

    console.log('All teams updated successfully.');
  } catch (error) {
    console.error('Error updating first eleven players:', error.message);
    throw error;
  }
};

module.exports = updateFirstEleven;