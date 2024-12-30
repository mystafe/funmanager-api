const express = require('express');
const Season = require('../models/Season');
const router = express.Router();
const saveAchievement = require('../utils/saveAchievement');
const Fixture = require('../models/Fixture');

// Aktif sezonu dönen API
router.get('/active', async (req, res) => {
  try {
    const activeSeason = await Season.findOne({ isCompleted: false });

    if (!activeSeason) {
      return res.status(404).json({ message: 'No active season found.' });
    }

    res.json({
      seasonId: activeSeason._id,
      seasonNumber: activeSeason.seasonNumber,
      isCompleted: activeSeason.isCompleted,
    });
  } catch (error) {
    console.error('Error fetching active season:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch active season.' });
  }
});

// Aktif sezonu pasif hale getiren API
router.put('/deactivate', async (req, res) => {
  try {
    const activeSeason = await Season.findOne({ isCompleted: false });

    if (!activeSeason) {
      return res.status(404).json({ message: 'No active season found to deactivate.' });
    }

    // Sezonun tüm maçlarının oynanıp oynanmadığını kontrol et
    const fixture = await Fixture.findOne({ season: activeSeason._id });
    const unplayedMatches = fixture.matches.filter(
      (match) => match.homeScore === null && match.awayScore === null
    );

    if (unplayedMatches.length > 0) {
      return res.status(400).json({
        error: `Season ${activeSeason.seasonNumber} cannot be deactivated. ${unplayedMatches.length} matches are still unplayed.`,
      });
    }

    // Başarıları kaydet
    await saveAchievement(activeSeason);

    // Aktif sezonu pasif hale getir
    activeSeason.isCompleted = true;
    await activeSeason.save();

    res.json({
      message: `Season ${activeSeason.seasonNumber} has been deactivated.`,
      season: activeSeason,
    });
  } catch (error) {
    console.error('Error deactivating season:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to deactivate active season.' });
  }
});

module.exports = router;