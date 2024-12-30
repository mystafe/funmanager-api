const express = require('express');
const router = express.Router();
const Fixture = require('../models/Fixture');
const Standing = require('../models/Standing');
const Player = require('../models/Player');
const Team = require('../models/Team');
const Season = require('../models/Season'); // Season modelini içe aktardık
const Achievement = require('../models/Achievement');
const Goal = require('../models/Goal');
const { saveAchievements } = require('../utils/achievementUtils');
const MatchResult = require('../models/MatchResult');
const { saveGoal, assignGoals } = require('../utils/goalUtils');
const playMatch = require('../utils/playMatch');



// router.post('/play', async (req, res) => {
//   const { matchId, homeScore, awayScore, goalScorers } = req.body;

//   try {
//     // Aktif sezonu kontrol et
//     const activeSeason = await Season.findOne({ isCompleted: false });
//     if (!activeSeason) {
//       return res.status(404).json({ error: 'No active season found.' });
//     }

//     // 1. Fikstürü güncelle
//     const fixture = await Fixture.findOneAndUpdate(
//       { 'matches._id': matchId, season: activeSeason._id }, // Sadece aktif sezonun maçları
//       {
//         $set: {
//           'matches.$.homeScore': homeScore,
//           'matches.$.awayScore': awayScore,
//         },
//       },
//       { new: true }
//     ).populate('matches.homeTeam matches.awayTeam');

//     if (!fixture) {
//       return res.status(404).json({ error: 'Match not found in the active season.' });
//     }

//     // 2. Standings güncelle
//     const match = fixture.matches.find(m => m._id.toString() === matchId);
//     if (!match) {
//       return res.status(404).json({ error: 'Match not found in the fixture.' });
//     }

//     const { homeTeam, awayTeam } = match;

//     const homeStanding = await Standing.findOneAndUpdate(
//       { team: homeTeam._id, season: activeSeason._id },
//       { $inc: { played: 1, goalsFor: homeScore, goalsAgainst: awayScore } },
//       { new: true, upsert: true }
//     );

//     const awayStanding = await Standing.findOneAndUpdate(
//       { team: awayTeam._id, season: activeSeason._id },
//       { $inc: { played: 1, goalsFor: awayScore, goalsAgainst: homeScore } },
//       { new: true, upsert: true }
//     );

//     if (homeScore > awayScore) {
//       homeStanding.wins += 1;
//       homeStanding.points += 3;
//       awayStanding.losses += 1;
//     } else if (homeScore < awayScore) {
//       awayStanding.wins += 1;
//       awayStanding.points += 3;
//       homeStanding.losses += 1;
//     } else {
//       homeStanding.draws += 1;
//       awayStanding.draws += 1;
//       homeStanding.points += 1;
//       awayStanding.points += 1;
//     }

//     homeStanding.goalDifference = homeStanding.goalsFor - homeStanding.goalsAgainst;
//     awayStanding.goalDifference = awayStanding.goalsFor - awayStanding.goalsAgainst;

//     await homeStanding.save();
//     await awayStanding.save();

//     // 3. Oyuncuları ve golleri güncelle
//     for (const scorerId of goalScorers) {
//       const scorer = await Player.findById(scorerId).populate('team');
//       if (!scorer) {
//         console.error(`Player with ID ${scorerId} not found.`);
//         continue;
//       }

//       // Golü kaydet
//       //eğer golü atan ev sahibi takım oyuncusu ise



//       if (scorer.team._id.toString() === homeTeam._id.toString()) {
//         await saveGoal(scorer, homeTeam, match, activeSeason);
//       }
//       else {
//         await saveGoal(scorer, awayTeam, match, activeSeason);
//       }

//       // Oyuncunun gol istatistiğini güncelle
//       await Player.findByIdAndUpdate(
//         scorerId,
//         { $push: { goals: matchId } },
//         { new: true }
//       );
//     }

//     res.json({
//       message: 'Match played successfully.',
//       match: {
//         matchId,
//         homeTeam: homeTeam.name,
//         awayTeam: awayTeam.name,
//         homeScore,
//         awayScore,
//       },
//       standings: { homeStanding, awayStanding },
//     });
//   } catch (error) {
//     console.error('Error processing match:', error.message);
//     res.status(500).json({ error: 'Failed to process match.' });
//   }
// });



// Tüm maçları oynatan API
router.post('/play-all-remaining', async (req, res) => {
  try {
    // Find the active season
    const activeSeason = await Season.findOne({ isCompleted: false });

    if (!activeSeason) {
      return res.status(404).json({ error: 'No active season found.' });
    }

    // Retrieve the fixture for the active season
    const fixture = await Fixture.findOne({ season: activeSeason._id })
      .populate('matches.homeTeam', 'name')
      .populate('matches.awayTeam', 'name')
      .exec();

    if (!fixture) {
      return res.status(404).json({ error: 'No fixture found for the active season.' });
    }

    // Filter matches that have not been played yet
    const remainingMatches = fixture.matches.filter(
      (match) => match.homeScore === null && match.awayScore === null
    );

    if (!remainingMatches.length) {
      return res.status(404).json({ error: 'No remaining matches to play in the active season.' });
    }

    // Play all remaining matches
    const playedMatches = await Promise.all(
      remainingMatches.map((match) => playMatch(match, activeSeason))
    );

    res.json({
      message: 'All remaining matches for the active season have been played.',
      playedMatches,
    });
  } catch (error) {
    console.error('Error processing all remaining matches:', error.message);
    res.status(500).json({ error: 'Failed to process all remaining matches.' });
  }
});

//play-week API'si
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

module.exports = router;

