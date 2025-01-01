const Team = require('../models/Team');
const Player = require('../models/Player');
const tacticFormation = require('../data/tactics');

/**
 * Güncel tüm takımların ilk 11 oyuncularını taktiğe göre günceller.
 * İlk 11, yedek oyuncuları, oyuncu güçlerini ve toplam gücü JSON olarak döndürür.
 */
const updateFirstEleven = async (req, res) => {
  try {
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

      // Grup oyuncuları pozisyonlarına göre
      const positionGroups = { Goalkeeper: [], Defence: [], Midfield: [], Forward: [] };
      team.players.forEach((player) => {
        positionGroups[player.position]?.push(player);
      });

      // Sıralama: Pozisyona göre uygun güç hesaplamaları
      const calculateStrength = (player, position) => {
        if (position === 'Goalkeeper') return player.goalkeeper * 1.5;
        if (position === 'Defence') return player.defense * 1.3 + player.attack * 0.3;
        if (position === 'Midfield') return player.defense * 0.8 + player.attack * 0.8;
        if (position === 'Forward') return player.attack * 1.5 + player.defense * 0.3;
        return 0;
      };

      for (const position in positionGroups) {
        positionGroups[position].forEach((player) => {
          player.strength = calculateStrength(player, position); // Güç hesaplaması
        });

        positionGroups[position].sort((a, b) => b.strength - a.strength);
      }

      // İlk 11'i seç
      const playersInFirstEleven = [];
      Object.entries(formation).forEach(([position, count]) => {
        playersInFirstEleven.push(...positionGroups[position].slice(0, count));
      });

      // İlk 11 oyuncularını pozisyonlarla ve güçleriyle yazdır
      console.log(`First eleven for ${team.name}:`);
      playersInFirstEleven.forEach((player) => {
        console.log(`- ${player.position}: ${player.name} (Strength: ${player.strength})`);
      });

      // Yedekleri seç
      const remainingPlayers = Object.values(positionGroups)
        .flat()
        .filter((player) => !playersInFirstEleven.includes(player));
      const playersOnBench = remainingPlayers.slice(0, 7);

      // Takım toplam gücünü hesapla
      const totalStrength = playersInFirstEleven.reduce((sum, player) => sum + player.strength, 0);

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
        firstEleven: playersInFirstEleven.map((p) => ({
          id: p._id,
          name: p.name,
          position: p.position,
          strength: p.strength,
        })),
        bench: playersOnBench.map((p) => ({
          id: p._id,
          name: p.name,
          position: p.position,
          strength: calculateStrength(p, p.position),
        })),
        totalStrength,
      });

      console.log(`First eleven and bench updated for ${team.name} with total strength: ${totalStrength}.`);
    }

    console.log('All teams updated successfully.');
    return res.json({ message: 'All teams updated successfully.', data: result });
  } catch (error) {
    console.error('Error updating first eleven players:', error.message);
    return res.status(500).json({ error: 'Failed to update first eleven players.' });
  }
};

module.exports = updateFirstEleven;