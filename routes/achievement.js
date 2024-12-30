const express = require('express');
const Achievement = require('../models/Achievement');
const router = express.Router();
const Team = require('../models/Team');
const Season = require('../models/Season');
const Standing = require('../models/Standing');
const Player = require('../models/Player');

// Tüm başarıları dönen API
router.get('/all', async (req, res) => {
  try {
    // Veritabanından tüm başarıları çek
    const achievements = await Achievement.find()
      .populate('champion', 'name') // Şampiyon takım bilgisi
      .populate({
        path: 'topScorers.player', // Gol kralı oyuncuları doldur
        select: 'name team', // Oyuncu adı ve takımı seç
        populate: {
          path: 'team', // Oyuncunun takımını doldur
          select: 'name', // Sadece takım adını getir
        },
      });

    if (!achievements.length) {
      return res.status(404).json({ error: 'No achievements found.' });
    }

    // Başarıları okunabilir bir formatta döndür
    const formattedAchievements = achievements.map((achievement) => ({
      season: achievement.seasonNumber,
      champion: achievement.champion ? achievement.champion.name : 'Unknown',
      topScorers: achievement.topScorers.map((scorer) => ({
        playerName: scorer.player.name,
        team: scorer.player.team ? scorer.player.team.name : 'Unknown',
        goals: scorer.goals,
      })),
    }));

    res.json(formattedAchievements);
  } catch (error) {
    console.error('Error fetching achievements:', error.message);
    res.status(500).json({ error: 'Failed to fetch achievements.' });
  }
});


// Belirli bir sezon numarasına ait başarıları dönen API
router.get('/achievements/:seasonNumber', async (req, res) => {
  const { seasonNumber } = req.params;

  try {
    // Sezonu bul
    const season = await Season.findOne({ seasonNumber: parseInt(seasonNumber) });
    if (!season) {
      return res.status(404).json({ error: `Season with number ${seasonNumber} not found.` });
    }

    // Sezona ait başarıları getir
    const achievements = await Achievement.find({ season: season._id })
      .populate('season', 'seasonNumber') // Sezon bilgisi
      .populate('topScorer.player', 'name') // Gol kralı oyuncu bilgisi
      .populate('champion.team', 'name'); // Şampiyon takım bilgisi

    if (!achievements.length) {
      return res.status(404).json({ error: `No achievements found for season number ${seasonNumber}.` });
    }

    res.json(achievements);
  } catch (error) {
    console.error(`Error fetching achievements for season number ${seasonNumber}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch achievements for the specified season.' });
  }
});

// Achievement güncelleyen API
router.post('/update-active', async (req, res) => {
  try {
    // Aktif sezonu bul
    const activeSeason = await Season.findOne({ isCompleted: true }).sort({ seasonNumber: -1 });
    if (!activeSeason) {
      return res.status(404).json({ error: 'No completed season found to update achievements.' });
    }

    // Şampiyonu bul
    const championStanding = await Standing.findOne({ season: activeSeason._id })
      .sort({ points: -1, goalDifference: -1 }) // Puan ve averaj sırasına göre
      .populate('team', 'name');

    if (!championStanding) {
      return res.status(404).json({ error: 'Champion not found for the completed season.' });
    }

    // Gol kralını bul
    const topScorer = await Player.aggregate([
      { $match: { 'goals.season': activeSeason._id } }, // Aktif sezondaki goller
      {
        $project: {
          name: 1,
          team: 1,
          goalCount: { $size: { $filter: { input: '$goals', as: 'goal', cond: { $eq: ['$$goal.season', activeSeason._id] } } } },
        },
      },
      { $sort: { goalCount: -1 } }, // Gol sayısına göre sırala
      { $limit: 1 }, // Sadece en çok gol atanı getir
    ]);

    if (!topScorer.length) {
      return res.status(404).json({ error: 'Top scorer not found for the completed season.' });
    }

    // Achievement kaydını güncelle veya oluştur
    const achievement = await Achievement.findOneAndUpdate(
      { season: activeSeason._id },
      {
        season: activeSeason._id,
        seasonNumber: activeSeason.seasonNumber,
        champion: {
          team: championStanding.team._id,
          teamName: championStanding.team.name,
        },
        topScorer: {
          player: topScorer[0]._id,
          playerName: topScorer[0].name,
          goals: topScorer[0].goalCount,
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Achievements updated successfully.',
      achievement,
    });
  } catch (error) {
    console.error('Error updating achievements:', error.message);
    res.status(500).json({ error: 'Failed to update achievements.' });
  }
});

// Tüm tamamlanmış sezonların başarılarını güncelleyen API
router.post('/update-all', async (req, res) => {
  try {
    // Tamamlanmış tüm sezonları bul
    const completedSeasons = await Season.find({ isCompleted: true }).sort({ seasonNumber: 1 });
    if (!completedSeasons.length) {
      return res.status(404).json({ error: 'No completed seasons found to update achievements.' });
    }

    const achievements = [];

    for (const season of completedSeasons) {
      // Şampiyonu bul
      const championStanding = await Standing.findOne({ season: season._id })
        .sort({ points: -1, goalDifference: -1 }) // Puan ve averaj sırasına göre
        .populate('team', 'name');

      if (!championStanding) {
        console.warn(`Champion not found for season ${season.seasonNumber}. Skipping...`);
        continue;
      }

      // Gol kralını bul
      const topScorer = await Player.aggregate([
        { $match: { 'goals.season': season._id } }, // Sezon gollerini filtrele
        {
          $project: {
            name: 1,
            team: 1,
            goalCount: { $size: { $filter: { input: '$goals', as: 'goal', cond: { $eq: ['$$goal.season', season._id] } } } },
          },
        },
        { $sort: { goalCount: -1 } }, // Gol sayısına göre sırala
        { $limit: 1 }, // En çok gol atanı getir
      ]);

      if (!topScorer.length) {
        console.warn(`Top scorer not found for season ${season.seasonNumber}. Skipping...`);
        continue;
      }

      // Achievement kaydını güncelle veya oluştur
      const achievement = await Achievement.findOneAndUpdate(
        { season: season._id },
        {
          season: season._id,
          seasonNumber: season.seasonNumber,
          champion: {
            team: championStanding.team._id,
            teamName: championStanding.team.name,
          },
          topScorer: {
            player: topScorer[0]._id,
            playerName: topScorer[0].name,
            goals: topScorer[0].goalCount,
          },
        },
        { upsert: true, new: true }
      );

      achievements.push(achievement);
    }

    if (!achievements.length) {
      return res.status(404).json({ error: 'No achievements were updated.' });
    }

    res.json({
      message: 'Achievements updated for all completed seasons.',
      achievements,
    });
  } catch (error) {
    console.error('Error updating achievements for all seasons:', error.message);
    res.status(500).json({ error: 'Failed to update achievements for all seasons.' });
  }
});


module.exports = router;