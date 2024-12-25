const express = require('express');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Season = require('../models/Season');
const Fixture = require('../models/Fixture');
const Standing = require('../models/Standing');
const MatchResult = require('../models/MatchResult');
const Goal = require('../models/Goal');
const Achievement = require('../models/Achievement');
const loadInitialData = require('../utils/loadInitialData');



const router = express.Router();

// Tüm verileri sıfırlayan API
router.delete('/', async (req, res) => {
  try {
    // Tüm verileri sil
    await Team.deleteMany({});
    console.log('All teams deleted.');

    await Player.deleteMany({});
    console.log('All players deleted.');

    await Season.deleteMany({});
    console.log('All seasons deleted.');

    await Fixture.deleteMany({});
    console.log('All fixtures deleted.');

    await MatchResult.deleteMany({});
    console.log('All match results deleted.');

    await Standing.deleteMany({});
    console.log('All standings deleted.');

    await Goal.deleteMany({});
    console.log('All goals deleted.');

    await Achievement.deleteMany({});
    console.log('All achievements deleted.');

    loadInitialData(); // Yeni verileri yükle
    console.log('All data has been reset ');

    res.json({ message: 'All data has been reset and reloaded.' });
  } catch (error) {
    console.error('Error resetting data:', error.message);
    res.status(500).json({ error: 'Failed to reset data.' });
  }
});


module.exports = router;
