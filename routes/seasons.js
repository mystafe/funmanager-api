const express = require('express');
const Season = require('../models/Season');
const router = express.Router();
const Team = require('../models/Team');
const Player = require('../models/Player');
const Fixture = require('../models/Fixture');
const { saveAchievements } = require('../utils/achievementUtils'); // saveAchievements fonksiyonunu içeri aktarın



// Aktif sezonu dönen API
router.get('/active', async (req, res) => {
  try {
    // Aktif sezonu kontrol et
    const activeSeason = await Season.findOne({ isCompleted: false });

    if (!activeSeason) {
      return res.status(404).json({ message: 'No active season found.' });
    }

    res.json({
      seasonId: activeSeason._id, // Sezon ID'si
      seasonNumber: activeSeason.seasonNumber,
      isCompleted: activeSeason.isCompleted,
    });
  } catch (error) {
    console.error('Error fetching active season:', error.message);
    res.status(500).json({ error: 'Failed to fetch active season.' });
  }
});
// Aktif sezonu pasif hale getiren API
router.put('/deactivate', async (req, res) => {
  try {
    // Aktif sezonu bul
    const activeSeason = await Season.findOne({ isCompleted: false });

    if (!activeSeason) {
      return res.status(404).json({ message: 'No active season found to deactivate.' });
    }

    // Başarıları kaydet
    await saveAchievements(activeSeason);

    // Aktif sezonu pasif hale getir
    activeSeason.isCompleted = true;
    await activeSeason.save();

    res.json({
      message: `Season ${activeSeason.seasonNumber} has been deactivated.`,
      season: activeSeason,
    });
  } catch (error) {
    console.error('Error deactivating season:', error.message);
    res.status(500).json({ error: 'Failed to deactivate active season.' });
  }
});

module.exports = router;