const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const Season = require('../models/Season');
const limit = 25;

router.get('/all', async (req, res) => {
  try {
    const goals = await Goal.find()
      .populate('season', 'seasonNumber')
      .populate('match', '_id')
      .populate('player', 'name')
      .populate('team', 'name');

    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error.message);
    res.status(500).json({ error: 'Failed to fetch goals.' });
  }
});


// Tüm sezonların gol kralları
router.get('/top-scorers/all', async (req, res) => {
  try {
    const topScorers = await Goal.aggregate([
      {
        $group: {
          _id: '$player',
          playerName: { $first: '$playerName' },
          teamName: { $first: '$teamName' },
          totalGoals: { $sum: 1 },
        },
      },
      { $sort: { totalGoals: -1 } },
      { $limit: limit },
    ]);

    res.json({
      message: 'Top scorers across all seasons',
      data: topScorers,
    });
  } catch (error) {
    console.error('Error fetching top scorers:', error.message);
    res.status(500).json({ error: 'Failed to fetch top scorers.' });
  }
});

// Aktif veya son sezonun gol kralları
router.get('/top-scorers/active-or-last', async (req, res) => {
  try {
    const activeSeason = await Season.findOne({ isCompleted: false }).sort({ seasonNumber: -1 });

    const targetSeason = activeSeason || (await Season.findOne().sort({ seasonNumber: -1 }));

    if (!targetSeason) {
      return res.status(404).json({ error: 'No seasons found.' });
    }

    const topScorers = await Goal.aggregate([
      { $match: { season: targetSeason._id } },
      {
        $group: {
          _id: '$player',
          playerName: { $first: '$playerName' },
          teamName: { $first: '$teamName' },
          totalGoals: { $sum: 1 },
        },
      },
      { $sort: { totalGoals: -1 } },
      { $limit: limit },
    ]);

    res.json({
      message: `Top scorers for season ${targetSeason.seasonNumber}`,
      season: targetSeason.seasonNumber,
      data: topScorers,
    });
  } catch (error) {
    console.error('Error fetching top scorers:', error.message);
    res.status(500).json({ error: 'Failed to fetch top scorers.' });
  }
});

// Belirtilen sezonun gol kralları
router.get('/top-scorers/:seasonNumber', async (req, res) => {
  const { seasonNumber } = req.params;

  try {
    const season = await Season.findOne({ seasonNumber: parseInt(seasonNumber) });

    if (!season) {
      return res.status(404).json({ error: `Season ${seasonNumber} not found.` });
    }

    const topScorers = await Goal.aggregate([
      { $match: { season: season._id } },
      {
        $group: {
          _id: '$player',
          playerName: { $first: '$playerName' },
          teamName: { $first: '$teamName' },
          totalGoals: { $sum: 1 },
        },
      },
      { $sort: { totalGoals: -1 } },
      { $limit: limit },
    ]);

    res.json({
      message: `Top scorers for season ${seasonNumber}`,
      season: seasonNumber,
      data: topScorers,
    });
  } catch (error) {
    console.error('Error fetching top scorers:', error.message);
    res.status(500).json({ error: 'Failed to fetch top scorers.' });
  }
});

module.exports = router;