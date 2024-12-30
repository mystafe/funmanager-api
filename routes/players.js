const express = require('express');
const Player = require('../models/Player');
const Season = require('../models/Season');
const router = express.Router();
const Goal = require('../models/Goal');
const Achievement = require('../models/Achievement');
const Team = require('../models/Team');


//##üm oyuncu istatistiklerini döner##
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
router.get('/top-scorers-all', async (req, res) => {
  try {
    // Retrieve all achievements
    const achievements = await Achievement.find({}).populate('topScorers.player');

    if (!achievements.length) {
      return res.status(404).json({ error: 'No achievements found across seasons.' });
    }

    // Aggregate total goals for each player
    const playerGoalsMap = new Map();

    achievements.forEach((achievement) => {
      achievement.topScorers.forEach((scorer) => {
        const playerId = scorer.player._id.toString();
        if (!playerGoalsMap.has(playerId)) {
          playerGoalsMap.set(playerId, {
            playerId: scorer.player._id,
            playerName: scorer.player.name,
            teamName: scorer.player.team?.name || 'No Team',
            totalGoals: 0,
          });
        }
        playerGoalsMap.get(playerId).totalGoals += scorer.goals;
      });
    });

    // Convert map to an array and sort by total goals in descending order
    const allTimeTopScorers = Array.from(playerGoalsMap.values()).sort(
      (a, b) => b.totalGoals - a.totalGoals
    );

    // Add rankings to the scorers
    const rankedScorers = allTimeTopScorers.map((scorer, index) => ({
      rank: index + 1,
      playerName: scorer.playerName,
      teamName: scorer.teamName,
      totalGoals: scorer.totalGoals,
    }));

    // Return the response
    res.json({
      message: 'All-time top scorers across all seasons.',
      topScorers: rankedScorers,
    });
  } catch (error) {
    console.error('Error fetching all-time top scorers:', error.message);
    res.status(500).json({ error: 'Failed to fetch all-time top scorers.' });
  }
});

// Gets top scorers for the active season or latest season if no active season exists.
router.get('/active-top-scorers', async (req, res) => {
  try {
    // Fetch the active season
    let season = await Season.findOne({ isCompleted: false });

    // If no active season, fallback to the latest season
    if (!season) {
      season = await Season.findOne().sort({ seasonNumber: -1 }); // Latest season
    }

    if (!season) {
      return res.status(404).json({ error: 'No seasons found.' });
    }

    // Fetch the achievement document for the season
    const achievement = await Achievement.findOne({ season: season._id }).populate('topScorers.player');

    if (!achievement || !achievement.topScorers.length) {
      return res.status(404).json({ error: `No achievements found for season ${season.seasonNumber}.` });
    }

    // Retrieve top 25 scorers sorted by goals in descending order
    const topScorers = achievement.topScorers
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 25);

    // Fetch team names and format the result
    const results = await Promise.all(
      topScorers.map(async (scorer, index) => {
        const player = await Player.findById(scorer.player).populate('team', 'name');
        return {
          rank: index + 1,
          playerName: player.name,
          teamName: player.team?.name || 'No Team',
          goals: scorer.goals,
        };
      })
    );

    // Return the response
    res.json({
      seasonNumber: season.seasonNumber,
      topScorers: results,
    });
  } catch (error) {
    console.error('Error fetching top scorers:', error.message);
    res.status(500).json({ error: 'Failed to fetch top scorers.' });
  }
});

// Belirli bir sezondaki gol kralı sıralamasını döner
router.get('/top-scorers/:seasonNumber', async (req, res) => {
  const { seasonNumber } = req.params;

  try {
    // Find the season by season number
    const season = await Season.findOne({ seasonNumber: parseInt(seasonNumber) });
    if (!season) {
      return res.status(404).json({ error: `Season ${seasonNumber} not found.` });
    }

    // Retrieve the achievement document for the season
    const achievement = await Achievement.findOne({ season: season._id }).populate('topScorers.player');

    if (!achievement || !achievement.topScorers.length) {
      return res.status(404).json({ error: `No achievements found for season ${seasonNumber}.` });
    }

    // Sort top scorers by goals in descending order
    const topScorers = achievement.topScorers.sort((a, b) => b.goals - a.goals);

    // Fetch team names and format the result
    const results = await Promise.all(
      topScorers.map(async (scorer, index) => {
        const player = await Player.findById(scorer.player).populate('team', 'name');
        return {
          rank: index + 1,
          playerName: player.name,
          teamName: player.team?.name || 'No Team',
          goals: scorer.goals,
        };
      })
    );

    // Return the response
    res.json({
      seasonNumber: season.seasonNumber,
      topScorers: results,
    });
  } catch (error) {
    console.error('Error fetching top scorers:', error.message);
    res.status(500).json({ error: 'Failed to fetch top scorers.' });
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
