const Team = require('../models/Team');
const Player = require('../models/Player');

/**
 * Güncel tüm takımların ilk 11 oyuncularını taktiğe göre günceller.
 * İlk 11 ve yedek oyuncuları JSON olarak döndürür.
 */
const updateFirstEleven = async (req, res) => {
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
    const result = [];

    for (const team of teams) {
      let formation = tacticFormation[team.defaultTactic];

      if (!formation) {
        console.warn(`Unknown tactic ${team.defaultTactic} for team ${team.name}. Setting default to 4-4-2.`);
        formation = tacticFormation['4-4-2'];
        team.defaultTactic = '4-4-2';
        await team.save();
      }

      console.log(`Processing team: ${team.name} with tactic: ${team.defaultTactic}`);

      // Grup oyuncuları pozisyonlarına göre
      const positionGroups = { Goalkeeper: [], Defence: [], Midfield: [], Forward: [] };
      team.players.forEach((player) => {
        positionGroups[player.position]?.push(player);
      });

      // Sıralama: Oyuncuları güce göre sırala
      for (const position in positionGroups) {
        positionGroups[position].sort((a, b) => {
          const strengthA = a.attack * 1.3 + a.defense * 1.2 + a.goalkeeper * 1.5;
          const strengthB = b.attack * 1.3 + b.defense * 1.2 + b.goalkeeper * 1.5;
          return strengthB - strengthA;
        });
      }

      // İlk 11'i seç
      const playersInFirstEleven = [];
      Object.entries(formation).forEach(([position, count]) => {
        playersInFirstEleven.push(...positionGroups[position].slice(0, count));
      });

      console.log(`First eleven for ${team.name}:`);
      playersInFirstEleven.forEach((player) => {
        console.log(`- ${player.position}: ${player.name}`);
      });

      // Yedekleri seç
      const remainingPlayers = Object.values(positionGroups)
        .flat()
        .filter((player) => !playersInFirstEleven.includes(player));
      const playersOnBench = remainingPlayers.slice(0, 7);

      // Oyuncu durumlarını güncelle
      await Player.updateMany(
        { _id: { $in: team.players.map((p) => p._id) } },
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

      // Takım durumlarını güncelle
      team.playersInFirstEleven = playersInFirstEleven.map((p) => p._id);
      team.playersOnBench = playersOnBench.map((p) => p._id);
      await team.save();

      result.push({
        teamName: team.name,
        defaultTactic: team.defaultTactic,
        firstEleven: playersInFirstEleven.map((p) => ({ id: p._id, name: p.name, position: p.position })),
        bench: playersOnBench.map((p) => ({ id: p._id, name: p.name, position: p.position })),
      });

      console.log(`First eleven and bench updated for ${team.name}.`);
    }

    console.log('All teams updated successfully.');
    return res.json({ message: 'All teams updated successfully.', data: result });
  } catch (error) {
    console.error('Error updating first eleven players:', error.message);
    return res.status(500).json({ error: 'Failed to update first eleven players.' });
  }
};

module.exports = updateFirstEleven;