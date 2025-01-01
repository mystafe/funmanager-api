const express = require('express');
const router = express.Router();
const Fixture = require('../models/Fixture');
const Season = require('../models/Season');
const playMatch = require('../utils/playMatch');
const saveGoal = require('../utils/saveGoal');
const generateMinutes = require('../utils/generateMinutes');
const Team = require('../models/Team');
const assignGoals = require('../utils/assignGoals');
const checkAndFinalizeSeason = require('../utils/checkAndFinalizeSeason');

// Tüm maçları oynatan API
router.post('/play-all-remaining', async (req, res) => {
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

    const remainingMatches = fixture.matches.filter(
      (match) => match.homeScore === null && match.awayScore === null
    );

    if (!remainingMatches.length) {
      return res.status(404).json({ error: 'No remaining matches to play in the active season.' });
    }

    await Promise.all(
      remainingMatches.map((match) => playMatch(match, activeSeason))
    );

    await checkAndFinalizeSeason(activeSeason); // Sezon tamamlanmasını kontrol et

    res.json({
      message: 'All remaining matches for the active season have been played and season finalized.',
    });
  } catch (error) {
    console.error('Error processing all remaining matches:', error.message);
    res.status(500).json({ error: 'Failed to process all remaining matches.' });
  }
});

// Belirli bir haftanın maçlarını oynatan API
router.post('/play-week/:seasonNumber/:week', async (req, res) => {
  const { seasonNumber, week } = req.params;

  try {
    const season = await Season.findOne({ seasonNumber: parseInt(seasonNumber) });

    if (!season) {
      return res.status(404).json({ error: `Season ${seasonNumber} not found.` });
    }

    const fixture = await Fixture.findOne({ season: season._id })
      .populate('matches.homeTeam', 'name')
      .populate('matches.awayTeam', 'name');

    if (!fixture) {
      return res.status(404).json({ error: `Fixture not found for season ${seasonNumber}.` });
    }

    const weekMatches = fixture.matches.filter(
      (match) =>
        match.week === parseInt(week) &&
        match.homeScore === null &&
        match.awayScore === null
    );

    if (!weekMatches.length) {
      return res.status(404).json({
        error: `No unplayed matches found for week ${week} in season ${seasonNumber}.`,
      });
    }

    const playedMatches = await Promise.all(
      weekMatches.map((match) => playMatch(match, season))
    );

    res.json({
      message: `Matches for week ${week} in season ${seasonNumber} played successfully.`,
      playedMatches,
    });
  } catch (error) {
    console.error('Error processing week matches:', error.message);
    res.status(500).json({ error: 'Failed to process week matches.' });
  }
});

// Belirli bir maçı oynatan API
router.post('/play-match', async (req, res) => {
  const { matchId, homeScorers, awayScorers } = req.body;

  try {
    const fixture = await Fixture.findOne({ 'matches._id': matchId }).populate('season');

    if (!fixture) {
      return res.status(404).json({ error: 'Match not found in fixture.' });
    }

    const match = fixture.matches.id(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found.' });
    }

    const homeScore = homeScorers.length;
    const awayScore = awayScorers.length;

    const homeMinutes = generateMinutes(homeScore);
    const awayMinutes = generateMinutes(awayScore);

    for (let i = 0; i < homeScorers.length; i++) {
      await saveGoal(homeScorers[i], match.homeTeam, matchId, fixture.season, homeMinutes[i], match.week);
    }

    for (let i = 0; i < awayScorers.length; i++) {
      await saveGoal(awayScorers[i], match.awayTeam, matchId, fixture.season, awayMinutes[i], match.week);
    }

    match.homeScore = homeScore;
    match.awayScore = awayScore;
    await fixture.save();

    res.json({
      message: 'Match played successfully.',
      matchId,
      homeScore,
      awayScore,
    });
  } catch (error) {
    console.error('Error playing match:', error.message);
    res.status(500).json({ error: 'Failed to play match.' });
  }
});

// Random skorlarla maçı oynatan API
router.post('/play-match-random', async (req, res) => {
  const { matchId } = req.body;

  try {
    const fixture = await Fixture.findOne({ 'matches._id': matchId }).populate('season');

    if (!fixture) {
      return res.status(404).json({ error: 'Match not found in fixture.' });
    }

    const match = fixture.matches.id(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found.' });
    }

    const homeTeam = await Team.findById(match.homeTeam).populate('players');
    const awayTeam = await Team.findById(match.awayTeam).populate('players');

    const homeChance = homeTeam.attackStrength / (awayTeam.defenseStrength + 1) + 0.25;
    const awayChance = awayTeam.attackStrength / (homeTeam.defenseStrength + 1);

    const homeScore = Math.floor(homeChance * Math.random() * 5);
    const awayScore = Math.floor(awayChance * Math.random() * 5);

    const homeScorers = await assignGoals(homeTeam.players, homeScore, match, fixture.season);
    const awayScorers = await assignGoals(awayTeam.players, awayScore, match, fixture.season);

    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.homeScorers = homeScorers;
    match.awayScorers = awayScorers;
    await fixture.save();

    res.json({
      message: 'Match played randomly based on team strengths.',
      matchId,
      homeScore,
      awayScore,
    });
  } catch (error) {
    console.error('Error playing random match:', error.message);
    res.status(500).json({ error: 'Failed to play match randomly.' });
  }
});

module.exports = router;