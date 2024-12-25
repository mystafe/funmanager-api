const express = require('express');
const Goal = require('../models/Goal');
const router = express.Router();

router.get('/', async (req, res) => {
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

module.exports = router;