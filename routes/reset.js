const express = require('express');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Season = require('../models/Season');
const Fixture = require('../models/Fixture');
const Standing = require('../models/Standing');
const MatchResult = require('../models/MatchResult');


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

    res.json({ message: 'All data has been reset.' });
  } catch (error) {
    console.error('Error resetting data:', error.message);
    res.status(500).json({ error: 'Failed to reset data.' });
  }
});


module.exports = router;
