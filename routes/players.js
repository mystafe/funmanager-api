const express = require('express');
const Player = require('../models/Player');
const Season = require('../models/Season');
const router = express.Router();
const Goal = require('../models/Goal');

// Tüm oyuncu istatistiklerini döner
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

// Genel gol kralı sıralamasını döner
router.get('/top-scorers', async (req, res) => {
  try {
    const players = await Player.find()
      .populate('team', 'name') // Takım bilgilerini getir
      .lean();

    const topScorers = players
      .map(player => ({
        playerId: player._id,
        name: player.name,
        team: player.team.name,
        totalGoals: player.goals.length,
      }))
      .filter(player => player.totalGoals > 0) // Sadece gol atan oyuncuları al
      .sort((a, b) => b.totalGoals - a.totalGoals) // Gol sayılarına göre sırala
      .slice(0, 25); // İlk 25 oyuncu

    res.json({ topScorers });
  } catch (error) {
    console.error('Error fetching top scorers:', error.message);
    res.status(500).json({ error: 'Failed to fetch top scorers.' });
  }
});

// Aktif sezondaki gol kralı sıralamasını döner
router.get('/active-top-scorers', async (req, res) => {
  try {
    const activeSeason = await Season.findOne({ isCompleted: false });

    if (!activeSeason) {
      return res.status(404).json({ error: 'No active season found.' });
    }

    // Tüm oyuncuları getir
    const players = await Player.find()
      .populate('team', 'name') // Takım bilgilerini getir
      .lean();

    console.log('Active Season:', activeSeason);
    console.log('Players Fetched:', players.length);
    console.log('Players:', players);

    const topScorers = players
      .map(player => {
        const totalGoals = player.goals.filter(goal =>
          goal.season?.toString() === activeSeason._id.toString()
        ).length;

        return {
          playerId: player._id,
          name: player.name,
          team: player.team.name,
          totalGoals,
        };
      })
      .filter(player => player.totalGoals > 0) // Sadece gol atan oyuncuları al
      .sort((a, b) => b.totalGoals - a.totalGoals); // Gol sayılarına göre sırala

    if (!topScorers.length) {
      return res.status(404).json({ error: 'No top scorers found for the active season.' });
    }

    res.json({ topScorers });
  } catch (error) {
    console.error('Error fetching top scorers for active season:', error.message);
    res.status(500).json({ error: 'Failed to fetch top scorers for active season.' });
  }
});

// Belirli bir sezondaki gol kralı sıralamasını döner
router.get('/top-scorers/:seasonNumber', async (req, res) => {
  const { seasonNumber } = req.params;

  try {
    // Sezonu sezon numarasına göre bul
    const season = await Season.findOne({ seasonNumber: parseInt(seasonNumber) });
    if (!season) {
      return res.status(404).json({ error: 'Season not found.' });
    }

    const players = await Player.find()
      .populate('team', 'name') // Takım bilgilerini getir
      .lean();

    const topScorers = players
      .map(player => ({
        playerId: player._id,
        name: player.name,
        team: player.team.name,
        totalGoals: player.goals.filter(goal => goal.season?.toString() === season._id.toString()).length,
      }))
      .filter(player => player.totalGoals > 0) // Sadece gol atan oyuncuları al
      .sort((a, b) => b.totalGoals - a.totalGoals); // Gol sayılarına göre sırala

    res.json({ topScorers });
  } catch (error) {
    console.error('Error fetching top scorers for season:', error.message);
    res.status(500).json({ error: 'Failed to fetch top scorers for season.' });
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
