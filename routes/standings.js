const express = require('express');
const Standing = require('../models/Standing');
const Team = require('../models/Team');
const Season = require('../models/Season');
const router = express.Router();
const Fixture = require('../models/Fixture');

// Son sezona ait puan durumunu dönen API
router.get('/latest', async (req, res) => {
  try {
    // Find the latest season
    const latestSeason = await Season.findOne().sort({ seasonNumber: -1 });

    if (!latestSeason) {
      return res.status(404).json({ error: 'No seasons found.' });
    }

    // Retrieve standings for the latest season
    const standings = await Standing.find({ season: latestSeason._id })
      .populate('team', 'name')
      .sort({ points: -1, goalDifference: -1, goalsFor: -1 });

    if (!standings.length) {
      return res.status(404).json({ error: `No standings found for season ${latestSeason.seasonNumber}.` });
    }

    // Format standings for the response
    const formattedStandings = standings.map((standing, index) => ({
      position: index + 1,
      team: standing.team.name,
      played: standing.played,
      wins: standing.wins,
      draws: standing.draws,
      losses: standing.losses,
      goalsFor: standing.goalsFor,
      goalsAgainst: standing.goalsAgainst,
      goalDifference: standing.goalDifference,
      points: standing.points,
    }));

    res.json({
      season: latestSeason.seasonNumber,
      standings: formattedStandings,
    });
  } catch (error) {
    console.error('Error fetching latest standings:', error.message);
    res.status(500).json({ error: 'Failed to fetch latest standings.' });
  }
});

// Verilen yıla ait puan durumunu dönen API
router.get('/season/:seasonNumber', async (req, res) => {
  const { seasonNumber } = req.params;

  try {
    // Find the specified season
    const season = await Season.findOne({ seasonNumber: parseInt(seasonNumber) });

    if (!season) {
      return res.status(404).json({ error: `Season ${seasonNumber} not found.` });
    }

    // Retrieve standings for the specified season
    const standings = await Standing.find({ season: season._id })
      .populate('team', 'name')
      .sort({ points: -1, goalDifference: -1, goalsFor: -1 });

    if (!standings.length) {
      return res.status(404).json({ error: `No standings found for season ${seasonNumber}.` });
    }

    // Format standings for the response
    const formattedStandings = standings.map((standing, index) => ({
      position: index + 1,
      team: standing.team.name,
      played: standing.played,
      wins: standing.wins,
      draws: standing.draws,
      losses: standing.losses,
      goalsFor: standing.goalsFor,
      goalsAgainst: standing.goalsAgainst,
      goalDifference: standing.goalDifference,
      points: standing.points,
    }));

    res.json({
      season: season.seasonNumber,
      standings: formattedStandings,
    });
  } catch (error) {
    console.error('Error fetching standings for season:', error.message);
    res.status(500).json({ error: 'Failed to fetch standings for the season.' });
  }
});

// Bir takımın detaylı puan durumu
router.get('/team/:teamId', async (req, res) => {
  const { teamId } = req.params;

  try {
    // Tüm takımların standings bilgilerini sırala
    const allStandings = await Standing.find()
      .populate('team', 'name')
      .sort({ points: -1, goalDifference: -1, goalsFor: -1 }); // Puan, averaj ve atılan gole göre sıralama

    if (!allStandings.length) {
      return res.status(404).json({ error: 'No standings data found.' });
    }

    // Hedef takımın standings bilgisi
    const standing = allStandings.find(standing => standing.team._id.toString() === teamId);
    if (!standing) {
      return res.status(404).json({ error: 'Team standings not found.' });
    }

    // Sıralama hesaplama
    const rank = allStandings.findIndex(s => s.team._id.toString() === teamId) + 1;

    // Takım bilgileri
    const team = await Team.findById(teamId).populate('players', 'name goals');
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    // Oyuncu gol bilgileri
    const playerStats = team.players.map(player => ({
      playerId: player._id,
      name: player.name,
      totalGoals: player.goals ? player.goals.length : 0, // Gol bilgisi kontrolü
    }));

    // Yanıt
    res.json({
      team: {
        id: team._id,
        name: team.name,
      },
      standing: {
        wins: standing.wins,
        losses: standing.losses,
        draws: standing.draws,
        goalsFor: standing.goalsFor,
        goalsAgainst: standing.goalsAgainst,
        goalDifference: standing.goalDifference,
        points: standing.points,
        rank: rank, // Sıralama bilgisi
      },
      players: playerStats,
    });
  } catch (error) {
    console.error('Error fetching team details:', error.message);
    res.status(500).json({ error: 'Failed to fetch team details.' });
  }
});

router.post('/update-by-fixture', async (req, res) => {
  try {
    // Aktif sezonu bul
    const activeSeason = await Season.findOne({ isCompleted: false });

    if (!activeSeason) {
      return res.status(404).json({ error: 'No active season found.' });
    }

    // Fikstürü getir
    const fixture = await Fixture.findOne({ season: activeSeason._id })
      .populate('matches.homeTeam', 'name')
      .populate('matches.awayTeam', 'name');

    if (!fixture) {
      return res.status(404).json({ error: 'No fixture found for the active season.' });
    }

    // Standings'i sıfırla
    await Standing.deleteMany({ season: activeSeason._id });

    const playedMatches = fixture.matches.filter(
      match => match.homeScore !== null && match.awayScore !== null
    );

    if (!playedMatches.length) {
      return res.status(404).json({ error: 'No played matches found in the active season.' });
    }

    for (const match of playedMatches) {
      // Home takım standings güncellemesi
      const homeStanding = await Standing.findOneAndUpdate(
        { team: match.homeTeam._id, season: activeSeason._id },
        {
          $inc: {
            played: 1,
            goalsFor: match.homeScore,
            goalsAgainst: match.awayScore,
          },
        },
        { new: true, upsert: true }
      );

      // Away takım standings güncellemesi
      const awayStanding = await Standing.findOneAndUpdate(
        { team: match.awayTeam._id, season: activeSeason._id },
        {
          $inc: {
            played: 1,
            goalsFor: match.awayScore,
            goalsAgainst: match.homeScore,
          },
        },
        { new: true, upsert: true }
      );

      // Puan durumu güncellemeleri
      if (match.homeScore > match.awayScore) {
        homeStanding.wins += 1;
        homeStanding.points += 3;
        awayStanding.losses += 1;
      } else if (match.homeScore < match.awayScore) {
        awayStanding.wins += 1;
        awayStanding.points += 3;
        homeStanding.losses += 1;
      } else {
        homeStanding.draws += 1;
        awayStanding.draws += 1;
        homeStanding.points += 1;
        awayStanding.points += 1;
      }

      // Gol farkı hesaplama
      homeStanding.goalDifference = homeStanding.goalsFor - homeStanding.goalsAgainst;
      awayStanding.goalDifference = awayStanding.goalsFor - awayStanding.goalsAgainst;

      await homeStanding.save();
      await awayStanding.save();
    }

    res.json({ message: 'Standings updated successfully based on played matches.' });
  } catch (error) {
    console.error('Error updating standings based on fixture:', error.message);
    res.status(500).json({ error: 'Failed to update standings.', message: error.message });
  }
});

module.exports = router;
