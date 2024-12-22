const express = require('express');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Fixture = require('../models/Fixture');
const router = express.Router();

// Tüm verileri dönen API


router.get('/', async (req, res) => {
  console.log('Fetching all data...');
  try {
    // Takımları al
    const teams = await Team.find().populate('players', 'name _id');

    // Oyuncuları al
    const players = await Player.find().populate('team', 'name _id');

    // Fikstürleri al
    const fixtures = await Fixture.find()
      .populate('matches.homeTeam', 'name _id')
      .populate('matches.awayTeam', 'name _id');

    // Tüm maçları organize et
    const matches = fixtures[0]?.matches.map(match => ({
      matchId: match._id,
      homeTeam: { id: match.homeTeam._id, name: match.homeTeam.name },
      awayTeam: { id: match.awayTeam._id, name: match.awayTeam.name },
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      week: match.week,
    })) || [];

    // Takımlar ve oyuncular organize ediliyor
    const teamData = teams.map(team => ({
      teamId: team._id,
      name: team.name,
      attackStrength: team.attackStrength, // Atak gücü
      defenseStrength: team.defenseStrength, // Defans gücü
      players: team.players.map(player => ({
        id: player._id,
        name: player.name,
      })),
    }));

    const playerData = players.map(player => ({
      playerId: player._id,
      name: player.name,
      team: { id: player.team._id, name: player.team.name },
      goals: player.goals, // Gol attığı maçların ID'leri
    }));

    res.json({
      teams: teamData,
      players: playerData,
      matches,
    });
  } catch (error) {
    console.error('Error fetching all data:', error.message);
    res.status(500).json({ error: 'Failed to fetch all data.' });
  }
});

module.exports = router;