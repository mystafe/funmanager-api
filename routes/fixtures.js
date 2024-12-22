const express = require('express');
const Season = require('../models/Season');
const Team = require('../models/Team');
const createFixture = require('../utils/createFixture');
const Fixture = require('../models/Fixture');
const router = express.Router();


// Fikstür oluşturma endpoint'i
router.post('/create', async (req, res) => {
  try {
    // Aktif sezonu kontrol et
    let activeSeason = await Season.findOne({ isCompleted: false });
    if (activeSeason) {
      return res.status(400).json({ error: 'There is already an active season. Complete it before creating a new one.' });
    }

    // Eğer aktif sezon yoksa yeni sezon oluştur
    const latestSeason = await Season.findOne().sort({ seasonNumber: -1 }); // En son sezonu bul
    const newSeasonNumber = latestSeason ? latestSeason.seasonNumber + 1 : 2024;

    activeSeason = new Season({
      seasonNumber: newSeasonNumber,
      isCompleted: false,
    });
    await activeSeason.save();

    console.log(`New season created: Season ${newSeasonNumber}`);

    // Takımları getir
    const teams = await Team.find();
    if (teams.length < 2) {
      return res.status(400).json({ error: 'Not enough teams to create a fixture.' });
    }

    // Fikstürü oluştur
    const fixture = await createFixture(activeSeason._id, teams);
    res.json({ message: 'Fixture created successfully.', season: activeSeason, fixture });
  } catch (error) {
    console.error('Error creating fixture:', error.message);
    res.status(500).json({ error: 'Failed to create fixture.' });
  }
});


// Tüm maçları dönen API
router.get('/all-matches', async (req, res) => {
  try {
    // Tüm fikstürleri getir
    const fixtures = await Fixture.find()
      .populate('matches.homeTeam', 'name')
      .populate('matches.awayTeam', 'name')
      .exec();

    if (!fixtures.length) {
      return res.status(404).json({ error: 'No fixtures found.' });
    }

    // Tüm maçları formatla
    const matches = fixtures[0].matches.map(match => ({
      week: match.week,
      homeTeam: match.homeTeam ? match.homeTeam.name : 'Bay',
      awayTeam: match.awayTeam ? match.awayTeam.name : 'Bay',
      matchDate: match.matchDate,
      score: match.homeScore !== null && match.awayScore !== null
        ? `${match.homeScore} - ${match.awayScore}`
        : 'Oynanmadı',
    }));

    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error.message);
    res.status(500).json({ error: 'Failed to fetch matches.' });
  }
});

module.exports = router;

// Belirli haftanın maçlarını dönen API
router.get('/week/:week', async (req, res) => {
  const { week } = req.params;

  try {
    // Tüm fikstürleri getir
    const fixtures = await Fixture.find()
      .populate('matches.homeTeam', 'name')
      .populate('matches.awayTeam', 'name')
      .exec();

    if (!fixtures.length) {
      return res.status(404).json({ error: 'No fixtures found.' });
    }

    // Belirtilen haftanın maçlarını filtrele
    const weekMatches = fixtures[0].matches
      .filter(match => match.week === parseInt(week))
      .map(match => ({
        matchId: match._id,
        week: match.week,
        homeTeam: match.homeTeam ? match.homeTeam.name : 'Bay',
        awayTeam: match.awayTeam ? match.awayTeam.name : 'Bay',
        matchDate: match.matchDate,
        score: match.homeScore !== null && match.awayScore !== null
          ? `${match.homeScore} - ${match.awayScore}`
          : 'Oynanmadı',
      }));

    if (!weekMatches.length) {
      return res.status(404).json({ error: `No matches found for week ${week}.` });
    }

    res.json(weekMatches);
  } catch (error) {
    console.error('Error fetching matches for week:', error.message);
    res.status(500).json({ error: 'Failed to fetch matches for the week.' });
  }
});

module.exports = router;