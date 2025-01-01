const express = require('express');
const Season = require('../models/Season');
const Team = require('../models/Team');
const createFixture = require('../utils/createFixture');
const Fixture = require('../models/Fixture');
const router = express.Router();
const loadInitialData = require('../utils/loadInitialData');

// Fikstür oluşturma endpoint'i
router.post('/create', async (req, res) => {
  try {
    // Aktif sezonu kontrol et
    let activeSeason = await Season.findOne({ isCompleted: false });
    if (activeSeason) {
      return res.status(400).json({ error: 'There is already an active season. Complete it before creating a new one.' });
    }

    // Yeni sezon oluştur
    const latestSeason = await Season.findOne().sort({ seasonNumber: -1 });
    const newSeasonNumber = latestSeason ? latestSeason.seasonNumber + 1 : 2024;

    activeSeason = new Season({
      seasonNumber: newSeasonNumber,
      isCompleted: false,
    });
    await activeSeason.save();

    console.log(`New season created: Season ${newSeasonNumber}`);

    // Takımları kontrol et
    let teams = await Team.find();
    if (teams.length < 2) {
      await loadInitialData();
      teams = await Team.find();
    }

    if (teams.length < 2) {
      return res.status(400).json({ error: 'Not enough teams available. Please add more teams.' });
    }

    // Fikstürün daha önce oluşturulup oluşturulmadığını kontrol et
    const existingFixture = await Fixture.findOne({ season: activeSeason._id });
    if (existingFixture) {
      return res.status(400).json({ error: `A fixture already exists for Season ${activeSeason.seasonNumber}.` });
    }

    // Fikstür oluştur
    const fixture = await createFixture(activeSeason._id, teams);

    res.json({
      message: 'Fixture created successfully.',
      seasonId: activeSeason._id,
      seasonNumber: activeSeason.seasonNumber,
      fixture,
    });
  } catch (error) {
    console.error('Error creating fixture:', error.message);
    res.status(500).json({ error: 'Failed to create fixture.' });
  }
});

// Haftanın maçlarını dönen API
router.get('/week/:week', async (req, res) => {
  const { week } = req.params;

  try {
    const activeSeason = await Season.findOne({ isCompleted: false });

    if (!activeSeason) {
      return res.status(404).json({ error: 'No active season found.' });
    }

    const fixture = await Fixture.findOne({ season: activeSeason._id })
      .populate('matches.homeTeam', 'name')
      .populate('matches.awayTeam', 'name');

    if (!fixture) {
      return res.status(404).json({ error: 'No fixture found for the active season.' });
    }

    const weekMatches = fixture.matches.filter(match => match.week === parseInt(week));

    if (!weekMatches.length) {
      return res.status(404).json({ error: `No matches found for week ${week} in the active season.` });
    }

    const matchesWithDetails = weekMatches.map(match => ({
      matchId: match._id,
      week: match.week,
      homeTeam: match.homeTeam ? match.homeTeam.name : 'Bay',
      awayTeam: match.awayTeam ? match.awayTeam.name : 'Bay',
      homeScore: match.homeScore ?? 'N/A',
      awayScore: match.awayScore ?? 'N/A',
      matchDate: match.matchDate || 'TBD',
    }));

    res.json(matchesWithDetails);
  } catch (error) {
    console.error('Error fetching matches for week:', error.message);
    res.status(500).json({ error: 'Failed to fetch matches for the week.' });
  }
});

// Verilen sezon ve haftanın maçlarını dönen API
router.get('/season/:seasonNumber/week/:week', async (req, res) => {
  const { seasonNumber, week } = req.params;

  try {
    const season = await Season.findOne({ seasonNumber: parseInt(seasonNumber) });
    if (!season) {
      return res.status(404).json({ error: `Season with number ${seasonNumber} not found.` });
    }

    const fixture = await Fixture.findOne({ season: season._id })
      .populate('matches.homeTeam', 'name')
      .populate('matches.awayTeam', 'name');

    if (!fixture) {
      return res.status(404).json({ error: 'No fixture found for the specified season.' });
    }

    const weekMatches = fixture.matches.filter(match => match.week === parseInt(week));
    if (!weekMatches.length) {
      return res.status(404).json({ error: `No matches found for week ${week} in season ${seasonNumber}.` });
    }

    const matchesWithDetails = weekMatches.map(match => ({
      matchId: match._id,
      homeTeam: match.homeTeam ? match.homeTeam.name : 'Bay',
      awayTeam: match.awayTeam ? match.awayTeam.name : 'Bay',
      homeScore: match.homeScore ?? 'N/A',
      awayScore: match.awayScore ?? 'N/A',
      matchDate: match.matchDate || 'TBD',
    }));

    res.json(matchesWithDetails);
  } catch (error) {
    console.error('Error fetching matches for the specified season and week:', error.message);
    res.status(500).json({ error: 'Failed to fetch matches for the specified season and week.' });
  }
});

// Tüm sezon maçlarını "pretty" dönen API
router.get('/season-matches-pretty/:seasonNumber', async (req, res) => {
  const { seasonNumber } = req.params;

  try {
    const activeSeason = await Season.findOne({ seasonNumber: parseInt(seasonNumber) });

    if (!activeSeason) {
      return res.status(404).json({ error: 'No season found.' });
    }

    const fixture = await Fixture.findOne({ season: activeSeason._id })
      .populate('matches.homeTeam', 'name')
      .populate('matches.awayTeam', 'name');

    if (!fixture || !fixture.matches.length) {
      return res.status(404).json({ error: 'No matches found for the season.' });
    }

    const matchesByWeek = fixture.matches.reduce((acc, match) => {
      const week = `Week ${match.week}`;

      if (!acc[week]) {
        acc[week] = [];
      }

      acc[week].push({
        homeTeam: match.homeTeam ? match.homeTeam.name : 'Bay',
        awayTeam: match.awayTeam ? match.awayTeam.name : 'Bay',
        homeScore: match.homeScore ?? 'N/A',
        awayScore: match.awayScore ?? 'N/A',
        matchDate: match.matchDate || 'TBD',
      });

      return acc;
    }, {});

    const response = Object.entries(matchesByWeek).map(([week, matches]) => ({
      week,
      matches,
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching season matches:', error.message);
    res.status(500).json({ error: 'Failed to fetch season matches.' });
  }
});

module.exports = router;