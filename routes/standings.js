const express = require('express');
const Standing = require('../models/Standing');
const Team = require('../models/Team');
const router = express.Router();

// Tüm puan durumunu dönen API
router.get('/all', async (req, res) => {
  try {
    const standings = await Standing.find().populate('team', 'name');

    if (!standings.length) {
      return res.status(404).json({ error: 'No standings found.' });
    }

    // Puan durumunu sıralı şekilde döndür
    const sortedStandings = standings.sort((a, b) => {
      if (b.points === a.points) {
        return b.goalDifference - a.goalDifference; // Aynı puanda ise averaj
      }
      return b.points - a.points; // Puan sıralaması
    });

    const response = sortedStandings.map((standing, index) => ({
      rank: index + 1,
      team: standing.team.name,
      played: standing.played,
      wins: standing.wins,
      draws: standing.draws,
      losses: standing.losses,
      goalsFor: standing.goalsFor,
      goalsAgainst: standing.goalsAgainst,
      goalDifference: standing.goalDifference,
      points: standing.points,
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching standings:', error.message);
    res.status(500).json({ error: 'Failed to fetch standings.' });
  }
});


// Bir takımın detaylı puan durumu
router.get('/team/:teamId', async (req, res) => {
  const { teamId } = req.params;

  try {
    // Tüm takımların standings bilgilerini sırala
    const allStandings = await Standing.find()
      .populate('team', 'name')
      .sort({ points: -1, goalDifference: -1, goalsFor: -1 }); // Puan, averaj ve atılan gole göre sıralama

    if (!allStandings.length) {
      return res.status(404).json({ error: 'No standings data found.' });
    }

    // Hedef takımın standings bilgisi
    const standing = allStandings.find(standing => standing.team._id.toString() === teamId);
    if (!standing) {
      return res.status(404).json({ error: 'Team standings not found.' });
    }

    // Sıralama hesaplama
    const rank = allStandings.findIndex(s => s.team._id.toString() === teamId) + 1;

    // Takım bilgileri
    const team = await Team.findById(teamId).populate('players', 'name goals');
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    // Oyuncu gol bilgileri
    const playerStats = team.players.map(player => ({
      playerId: player._id,
      name: player.name,
      totalGoals: player.goals ? player.goals.length : 0, // Gol bilgisi kontrolü
    }));

    // Yanıt
    res.json({
      team: {
        id: team._id,
        name: team.name,
      },
      standing: {
        wins: standing.wins,
        losses: standing.losses,
        draws: standing.draws,
        goalsFor: standing.goalsFor,
        goalsAgainst: standing.goalsAgainst,
        goalDifference: standing.goalDifference,
        points: standing.points,
        rank: rank, // Sıralama bilgisi
      },
      players: playerStats,
    });
  } catch (error) {
    console.error('Error fetching team details:', error.message);
    res.status(500).json({ error: 'Failed to fetch team details.' });
  }
});

module.exports = router;
