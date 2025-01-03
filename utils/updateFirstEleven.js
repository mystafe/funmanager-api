const Team = require('../models/Team');
const Player = require('../models/Player');
const tacticFormation = require('../data/tactics');
const determineFirstEleven = require('./determineFirstEleven');

/**
 * Güncel tüm takımların ilk 11 oyuncularını taktiğe göre günceller.
 * İlk 11, yedek oyuncuları, oyuncu güçlerini ve toplam gücü JSON olarak döndürür.
 */
const updateFirstEleven = async (req, res) => {
  try {
    const teams = await Team.find().populate('players');
    const result = [];

    for (const team of teams) {
      const tactic = tacticFormation[team.defaultTactic] || tacticFormation['4-4-2'];
      const { playersInFirstEleven, playersOnBench, totalStrength } = determineFirstEleven(team.players, tactic);

      // Tüm oyuncuların durumlarını sıfırla
      await Player.updateMany(
        { _id: { $in: team.players.map((p) => p._id) } },
        { isFirstEleven: false, isMatchSquad: false }
      );
      await Player.updateMany(
        { _id: { $in: playersInFirstEleven.map((p) => p._id) } },
        { isFirstEleven: true, isMatchSquad: true }
      );
      await Player.updateMany(
        { _id: { $in: playersOnBench.map((p) => p._id) } },
        { isMatchSquad: true }
      );

      // Takım bilgilerini güncelle
      team.playersInFirstEleven = playersInFirstEleven.map((p) => p._id);
      team.playersOnBench = playersOnBench.map((p) => p._id);
      team.attackStrength = totalStrength.attack; // Toplam hücum gücü
      team.defenseStrength = totalStrength.defense; // Toplam defans gücü
      await team.save();

      // Dönen sonucu detaylandır
      result.push({
        teamName: team.name,
        totalStrength: totalStrength, // Takımın toplam gücü (hücum ve savunma)
        firstEleven: playersInFirstEleven.map((p) => ({
          id: p._id,
          name: p.name,
          position: p.position,
          strength: p.strength, // Bireysel güç
        })),
        bench: playersOnBench.map((p) => ({
          id: p._id,
          name: p.name,
          position: p.position,
          strength: p.strength, // Bireysel güç
        })),
      });
    }

    console.log('All teams updated successfully.');
    res.json({ message: 'All teams updated successfully.', data: result });
  } catch (error) {
    console.error('Error updating first eleven players:', error.message);
    res.status(500).json({ error: 'Failed to update first eleven players.' });
  }
};

module.exports = updateFirstEleven;