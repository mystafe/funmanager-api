const express = require('express');
const Fixture = require('../models/Fixture');
const Standing = require('../models/Standing');
const Player = require('../models/Player');
const router = express.Router();
const Team = require('../models/Team');
const Season = require('../models/Season'); // Season modelini içe aktardık
const { saveGoal } = require('../utils/goalUtils'); // saveGoal fonksiyonunu import edin
const Achievement = require('../models/Achievement');
const Goal = require('../models/Goal');
const { saveAchievements } = require('../utils/achievementUtils');


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
    if (!match) {
      return res.status(404).json({ error: 'Match not found in the fixture.' });
    }

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

    // 3. Oyuncuları ve golleri güncelle
    for (const scorerId of goalScorers) {
      const scorer = await Player.findById(scorerId).populate('team');
      if (!scorer) {
        console.error(`Player with ID ${scorerId} not found.`);
        continue;
      }

      // Golü kaydet
      //eğer golü atan ev sahibi takım oyuncusu ise
      if (scorer.team._id.toString() === homeTeam._id.toString()) {
        await saveGoal(scorer, homeTeam, match, activeSeason);
      }
      else {
        await saveGoal(scorer, awayTeam, match, activeSeason);
      }

      // Oyuncunun gol istatistiğini güncelle
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
    // Aktif sezonu kontrol et
    const activeSeason = await Season.findOne({ isCompleted: false });
    if (!activeSeason) {
      return res.status(404).json({ error: 'No active season found.' });
    }

    // Aktif sezonun fikstürünü al
    const fixture = await Fixture.findOne({ season: activeSeason._id })
      .populate('matches.homeTeam', 'name')
      .populate('matches.awayTeam', 'name');

    if (!fixture) {
      return res.status(404).json({ error: 'No fixture found for the active season.' });
    }

    // Oynanmamış hafta maçlarını filtrele
    const weekMatches = fixture.matches.filter(
      match => match.week === parseInt(week) && match.homeScore === null && match.awayScore === null
    );

    if (!weekMatches.length) {
      return res.status(404).json({ error: `No unplayed matches found for week ${week} in the active season.` });
    }

    // Gol atama işlemi için yardımcı fonksiyon
    const assignGoals = async (players, goals, match, season) => {
      const weightedPlayers = [];
      players.forEach(player => {
        const weight = Math.ceil(player.attack / 10); // Atak gücüne göre ağırlık
        for (let i = 0; i < weight; i++) {
          weightedPlayers.push(player);
        }
      });

      const scorers = [];
      for (let i = 0; i < goals; i++) {
        const scorer = weightedPlayers[Math.floor(Math.random() * weightedPlayers.length)];
        scorers.push(scorer._id);

        // Golü kaydet
        //eğer golü atan ev sahibi takım oyuncusu ise
        if (scorer.team._id.toString() === match.homeTeam._id.toString()) {
          await saveGoal(scorer, match.homeTeam, match, season);
        } else {
          await saveGoal(scorer, match.awayTeam, match, season);
        }

        // Oyuncunun gol istatistiğini güncelle
        await Player.findByIdAndUpdate(
          scorer._id,
          { $push: { goals: match._id } },
          { new: true }
        );
      }

      return scorers;
    };

    const playedMatches = [];

    for (const match of weekMatches) {
      // Takımları getir ve oyuncuları al
      const homeTeam = await Team.findById(match.homeTeam._id).populate('players');
      const awayTeam = await Team.findById(match.awayTeam._id).populate('players');

      // Takımların güçlerini hesapla
      const homeAttack = homeTeam.attackStrength || 0;
      const awayAttack = awayTeam.attackStrength || 0;

      const homeDefense = homeTeam.defenseStrength || 0;
      const awayDefense = awayTeam.defenseStrength || 0;

      const homeChance = homeAttack / (awayDefense + 1) + 0.25; // Ev sahibi avantajı
      const awayChance = awayAttack / (homeDefense + 1);

      // Rastgele skor üret
      const homeScore = Math.floor(homeChance * Math.random() * 5);
      const awayScore = Math.floor(awayChance * Math.random() * 5);

      // Gol atan oyuncuları belirle
      const homeScorers = await assignGoals(homeTeam.players, homeScore, match, activeSeason);
      const awayScorers = await assignGoals(awayTeam.players, awayScore, match, activeSeason);

      // Fikstürü güncelle
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

      // Standings Güncellemesi
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

      // Maç sonucu puan hesaplama
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

      // Averaj güncellemesi
      homeStanding.goalDifference = homeStanding.goalsFor - homeStanding.goalsAgainst;
      awayStanding.goalDifference = awayStanding.goalsFor - awayStanding.goalsAgainst;

      await homeStanding.save();
      await awayStanding.save();

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

//play-all API'si
router.post('/play-all', async (req, res) => {
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

    const unplayedMatches = fixture.matches.filter(
      match => match.homeScore === null && match.awayScore === null
    );

    if (!unplayedMatches.length) {
      return res.status(404).json({ error: 'No unplayed matches found for the active season.' });
    }

    const assignGoals = async (players, goals, match, season) => {
      const weightedPlayers = [];
      players.forEach(player => {
        const weight = Math.ceil(player.attack / 10);
        for (let i = 0; i < weight; i++) {
          weightedPlayers.push(player);
        }
      });

      const scorers = [];
      for (let i = 0; i < goals; i++) {
        const scorer = weightedPlayers[Math.floor(Math.random() * weightedPlayers.length)];
        scorers.push(scorer._id);

        if (scorer.team._id.toString() === match.homeTeam._id.toString()) {
          await saveGoal(scorer, match.homeTeam, match, season);
        } else {
          await saveGoal(scorer, match.awayTeam, match, season);
        }

        await Player.findByIdAndUpdate(
          scorer._id,
          { $push: { goals: match._id } },
          { new: true }
        );
      }

      return scorers;
    };

    const playedMatches = [];

    for (const match of unplayedMatches) {
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

      const homeScorers = await assignGoals(homeTeam.players, homeScore, match, activeSeason);
      const awayScorers = await assignGoals(awayTeam.players, awayScore, match, activeSeason);

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

    // Şampiyonu ve gol kralını belirle
    const standings = await Standing.find({ season: activeSeason._id })
      .populate('team', 'name')
      .sort({ points: -1, goalDifference: -1 });

    const championTeam = standings[0].team;

    const players = await Player.find()
      .populate('team', 'name')
      .lean();

    const topScorer = players
      .map(player => ({
        playerId: player._id,
        playerName: player.name,
        team: player.team._id,
        teamName: player.team.name,
        goals: player.goals.length,
      }))
      .sort((a, b) => b.goals - a.goals)[0];

    const newAchievement = new Achievement({
      season: activeSeason._id,
      seasonNumber: activeSeason.seasonNumber,
      champion: {
        team: championTeam._id,
        teamName: championTeam.name,
      },
      topScorer: {
        player: topScorer.playerId,
        playerName: topScorer.playerName,
        team: topScorer.team,
        teamName: topScorer.teamName,
        goals: topScorer.goals,
      },
    });

    await newAchievement.save();

    activeSeason.isCompleted = true;
    await activeSeason.save();

    res.json({
      message: 'All matches for the active season played successfully. Achievements updated.',
      playedMatches,
      achievement: newAchievement,
    });
  } catch (error) {
    console.error('Error processing all matches:', error.message);
    res.status(500).json({ error: 'Failed to process all matches.' });
  }
});
module.exports = router;

