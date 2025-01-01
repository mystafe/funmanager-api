const express = require('express');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Season = require('../models/Season');
const Fixture = require('../models/Fixture');
const Standing = require('../models/Standing');
const Goal = require('../models/Goal');
const Achievement = require('../models/Achievement');
const Training = require('../models/Training');
const Sponsor = require('../models/Sponsor');
const Stadium = require('../models/Stadium');
const loadInitialData = require('../utils/loadInitialData');



const router = express.Router();

// Tüm verileri sıfırlayan API
router.delete('/reset', async (req, res) => {
  try {
    // Tüm verileri sil
    await Team.deleteMany({});
    await Player.deleteMany({});
    await Season.deleteMany({});
    await Fixture.deleteMany({});
    await Standing.deleteMany({});
    await Goal.deleteMany({});
    await Achievement.deleteMany({});
    await Training.deleteMany({});
    await Sponsor.deleteMany({});
    await Stadium.deleteMany({});

    res.json({ message: 'All data has deleted .' });
  } catch (error) {
    console.error('Error resetting data:', error.message);
    res.status(500).json({ error: 'Failed to delete data.' });
  }
});

// Tüm verileri sıfırlayıp resetleyen API
router.delete('/reload', async (req, res) => {
  try {
    // Tüm verileri sil
    await Team.deleteMany({});
    await Player.deleteMany({});
    await Season.deleteMany({});
    await Fixture.deleteMany({});
    await Standing.deleteMany({});
    await Goal.deleteMany({});
    await Achievement.deleteMany({});
    await Training.deleteMany({});
    await Sponsor.deleteMany({});
    await Stadium.deleteMany({});

    loadInitialData(); // Yeni verileri yükle
    console.log('All data has been reset ');

    res.json({ message: 'All data has been reset and reloaded.' });
  } catch (error) {
    console.error('Error resetting data:', error.message);
    res.status(500).json({ error: 'Failed to reset data.' });
  }
});


module.exports = router;
