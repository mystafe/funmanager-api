const express = require('express');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Fixture = require('../models/Fixture');
const router = express.Router();

// Fetch all data
router.get('/', async (req, res) => {
  console.log('Fetching all data...');
  try {
    // Fetch teams
    const teams = await Team.find().populate('players', 'name _id');

    // Fetch players
    const players = await Player.find()
      .populate('team', 'name _id')
      .populate('goals', '_id minute match');

    // Fetch fixtures
    const fixtures = await Fixture.find()
      .populate('matches.homeTeam', 'name _id')
      .populate('matches.awayTeam', 'name _id');

    // Organize matches
    const matches = fixtures[0]?.matches.map(match => ({
      matchId: match._id,
      homeTeam: match.homeTeam
        ? { id: match.homeTeam._id, name: match.homeTeam.name }
        : null,
      awayTeam: match.awayTeam
        ? { id: match.awayTeam._id, name: match.awayTeam.name }
        : null,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      week: match.week,
    })) || [];

    // Organize team data
    const teamData = teams.map(team => ({
      teamId: team._id,
      name: team.name,
      attackStrength: team.attackStrength,
      defenseStrength: team.defenseStrength,
      players: team.players.map(player => ({
        id: player._id,
        name: player.name,
      })),
    }));

    // Organize player data
    const playerData = players.map(player => ({
      playerId: player._id,
      name: player.name,
      team: player.team
        ? { id: player.team._id, name: player.team.name }
        : null,
      goals: player.goals.map(goal => ({
        id: goal._id,
        minute: goal.minute,
        match: goal.match,
      })),
    }));

    res.json({
      teams: teamData,
      players: playerData,
      matches,
    });
  } catch (error) {
    console.error('Error fetching all data:', error.message);
    res.status(500).json({ error: `Failed to fetch all data: ${error.message}` });
  }
});

module.exports = router;