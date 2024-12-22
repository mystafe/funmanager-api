const express = require('express');
const Fixture = require('../models/Fixture');
const Standing = require('../models/Standing');
const Player = require('../models/Player');
const router = express.Router();
const Team = require('../models/Team');
const Season = require('../models/Season'); // Season modelini içe aktardık


// Maçı oynayıp sonucu işleyen API
router.post('/play', async (req, res) => {
  const { matchId, homeScore, awayScore, goalScorers } = req.body;

  try {
    // Aktif sezonu kontrol et
    const activeSeason = await Season.findOne({ isCompleted: false });
    if (!activeSeason) {
      return res.status(404).json({ error: 'No active season found.' });
    }

    // 1. Fikstürü güncelle
    const fixture = await Fixture.findOneAndUpdate(
      { 'matches._id': matchId, season: activeSeason._id }, // Sadece aktif sezonun maçları
      {
        $set: {
          'matches.$.homeScore': homeScore,
          'matches.$.awayScore': awayScore,
        },
      },
      { new: true }
    ).populate('matches.homeTeam matches.awayTeam');

    if (!fixture) {
      return res.status(404).json({ error: 'Match not found in the active season.' });
    }

    // 2. Standings güncelle
    const match = fixture.matches.find(m => m._id.toString() === matchId);
    const { homeTeam, awayTeam } = match;

    const homeStanding = await Standing.findOneAndUpdate(
      { team: homeTeam._id, season: activeSeason._id },
      { $inc: { played: 1, goalsFor: homeScore, goalsAgainst: awayScore } },
      { new: true, upsert: true }
    );

    const awayStanding = await Standing.findOneAndUpdate(
      { team: awayTeam._id, season: activeSeason._id },
      { $inc: { played: 1, goalsFor: awayScore, goalsAgainst: homeScore } },
      { new: true, upsert: true }
    );

    // Maç sonucu puan güncellemesi
    if (homeScore > awayScore) {
      homeStanding.wins += 1;
      homeStanding.points += 3;
      awayStanding.losses += 1;
    } else if (homeScore < awayScore) {
      awayStanding.wins += 1;
      awayStanding.points += 3;
      homeStanding.losses += 1;
    } else {
      homeStanding.draws += 1;
      awayStanding.draws += 1;
      homeStanding.points += 1;
      awayStanding.points += 1;
    }

    homeStanding.goalDifference = homeStanding.goalsFor - homeStanding.goalsAgainst;
    awayStanding.goalDifference = awayStanding.goalsFor - awayStanding.goalsAgainst;

    await homeStanding.save();
    await awayStanding.save();

    // 3. Oyuncuları güncelle
    for (const scorerId of goalScorers) {
      await Player.findByIdAndUpdate(
        scorerId,
        { $push: { goals: matchId } },
        { new: true }
      );
    }

    res.json({
      message: 'Match played successfully.',
      match: {
        matchId,
        homeTeam: homeTeam.name,
        awayTeam: awayTeam.name,
        homeScore,
        awayScore,
      },
      standings: { homeStanding, awayStanding },
    });
  } catch (error) {
    console.error('Error processing match:', error.message);
    res.status(500).json({ error: 'Failed to process match.' });
  }
});

// Rastgele maçları oynatan API
router.post('/play-week/:week', async (req, res) => {
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

    const weekMatches = fixture.matches.filter(
      match => match.week === parseInt(week) && match.homeScore === null && match.awayScore === null
    );

    if (!weekMatches.length) {
      return res.status(404).json({ error: `No unplayed matches found for week ${week} in the active season.` });
    }

    const playedMatches = [];

    // Gol atan oyuncuları belirlemek için async fonksiyon
    const assignGoals = async (players, goals, matchId) => {
      const weightedPlayers = [];
      players.forEach(player => {
        const weight = Math.ceil(player.attack / 10); // Atak gücüne göre ağırlık
        for (let i = 0; i < weight; i++) {
          weightedPlayers.push(player._id);
        }
      });

      const scorers = [];
      for (let i = 0; i < goals; i++) {
        const scorer = weightedPlayers[Math.floor(Math.random() * weightedPlayers.length)];
        scorers.push(scorer);

        // Oyuncunun gol attığı maçlar güncellenir
        await Player.findByIdAndUpdate(scorer, { $push: { goals: matchId } });
      }

      return scorers;
    };

    for (const match of weekMatches) {
      const homeTeam = await Team.findById(match.homeTeam._id).populate('players');
      const awayTeam = await Team.findById(match.awayTeam._id).populate('players');

      const homeAttack = homeTeam.attackStrength || 0;
      const awayAttack = awayTeam.attackStrength || 0;

      const homeDefense = homeTeam.defenseStrength || 0;
      const awayDefense = awayTeam.defenseStrength || 0;

      const homeChance = homeAttack / (awayDefense + 1) + 0.25;
      const awayChance = awayAttack / (homeDefense + 1);

      const homeScore = Math.floor(homeChance * Math.random() * 5);
      const awayScore = Math.floor(awayChance * Math.random() * 5);

      // Gol atan oyuncuları belirle
      const homeScorers = await assignGoals(homeTeam.players, homeScore, match._id);
      const awayScorers = await assignGoals(awayTeam.players, awayScore, match._id);

      await Fixture.updateOne(
        { 'matches._id': match._id },
        {
          $set: {
            'matches.$.homeScore': homeScore,
            'matches.$.awayScore': awayScore,
            'matches.$.homeScorers': homeScorers,
            'matches.$.awayScorers': awayScorers,
          },
        }
      );

      playedMatches.push({
        matchId: match._id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        homeScore,
        awayScore,
        homeScorers,
        awayScorers,
      });
    }

    res.json({
      message: `Matches for week ${week} played successfully.`,
      playedMatches,
    });
  } catch (error) {
    console.error('Error processing matches:', error.message);
    res.status(500).json({ error: 'Failed to process matches.' });
  }
});
module.exports = router;

