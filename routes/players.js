const express = require('express');
const Player = require('../models/Player');
const router = express.Router();


//##üm oyuncu istatistiklerini döner##
router.get('/stats', async (req, res) => {
  try {
    const players = await Player.find()
      .populate('team', 'name')
      .lean();

    const playerStats = players
      .map(player => ({
        playerId: player._id,
        name: player.name,
        team: player.team.name,
        totalGoals: player.goals.length,
        goalMatches: player.goals, // Gol attığı maçların ID'leri
      }))
      .sort((a, b) => b.totalGoals - a.totalGoals); // Gol sayılarına göre sırala

    res.json({ playerStats });
  } catch (error) {
    console.error('Error fetching player stats:', error.message);
    res.status(500).json({ error: 'Failed to fetch player stats.' });
  }
});

// 1. Oyuncuların isimlerini, ID'lerini ve toplam attıkları gol sayılarını dönen API
router.get('/full-details', async (req, res) => {
  try {
    const players = await Player.find({}, 'name goals').lean();

    const playerDetails = players.map(player => ({
      playerId: player._id,
      name: player.name,
      totalGoals: player.goals ? player.goals.length : 0, // Attığı toplam gol
    }));

    res.json(playerDetails);
  } catch (error) {
    console.error('Error fetching player details:', error.message);
    res.status(500).json({ error: 'Failed to fetch player details.' });
  }
});

// 2. Sadece oyuncuların soyisimlerini ve ID'lerini dönen API
router.get('/basic', async (req, res) => {
  try {
    const players = await Player.find({}, 'name').lean();

    const playerBasicDetails = players.map(player => {
      const lastName = player.name.split(' ').slice(-1).join(' '); // Soyadı al
      return {
        playerId: player._id,
        lastName: lastName,
      };
    });

    res.json(playerBasicDetails);
  } catch (error) {
    console.error('Error fetching basic player details:', error.message);
    res.status(500).json({ error: 'Failed to fetch basic player details.' });
  }
});

module.exports = router;
