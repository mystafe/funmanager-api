const express = require('express');
const Season = require('../models/Season');
const router = express.Router();
const saveAchievement = require('../utils/saveAchievement');
const Fixture = require('../models/Fixture');
const checkAndFinalizeSeason = require('../utils/checkAndFinalizeSeason');

// Aktif sezonu getir
const getActiveSeason = async () => {
  return await Season.findOne({ isCompleted: false });
};

// Aktif sezonu dönen API
router.get('/active', async (req, res) => {
  try {
    const activeSeason = await getActiveSeason();

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
    const activeSeason = await getActiveSeason();

    if (!activeSeason) {
      return res.status(404).json({ message: 'No active season found to deactivate.' });
    }

    // Sezonun fikstürünü kontrol et
    const fixture = await Fixture.findOne({ season: activeSeason._id });
    if (!fixture) {
      return res.status(404).json({ message: `No fixture found for Season ${activeSeason.seasonNumber}.` });
    }

    // Oynanmamış maçları kontrol et
    const unplayedMatches = fixture.matches.filter(
      (match) => match.homeScore === null && match.awayScore === null
    );

    if (unplayedMatches.length > 0) {
      return res.status(400).json({
        error: `Season ${activeSeason.seasonNumber} cannot be deactivated. ${unplayedMatches.length} matches are still unplayed.`,
      });
    }

    // Başarıları kaydet
    try {
      await saveAchievement(activeSeason);
    } catch (achievementError) {
      console.error('Error saving achievements:', achievementError.message);
      return res.status(500).json({ error: 'Failed to save achievements for the season.' });
    }

    // Aktif sezonu tamamlanmış olarak işaretle
    activeSeason.isCompleted = true;
    await activeSeason.save();

    res.json({
      message: `Season ${activeSeason.seasonNumber} has been deactivated and marked as completed.`,
      season: activeSeason,
    });
  } catch (error) {
    console.error('Error deactivating season:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to deactivate active season.' });
  }
});

// Sezonu tamamlayan API
router.get('/finalize', async (req, res) => {
  try {
    const activeSeason = await getActiveSeason();

    if (!activeSeason) {
      return res.status(404).json({ message: 'No active season found to finalize.' });
    }

    await checkAndFinalizeSeason(activeSeason);

    res.json({ message: `Season ${activeSeason.seasonNumber} has been finalized.` });
  } catch (error) {
    console.error('Error finalizing season:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to finalize active season.' });
  }
}
);


module.exports = router;