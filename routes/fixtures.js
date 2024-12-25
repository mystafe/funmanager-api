const express = require('express');
const Season = require('../models/Season');
const Team = require('../models/Team');
const createFixture = require('../utils/createFixture');
const Fixture = require('../models/Fixture');
const router = express.Router();
const Player = require('../models/Player');
const Standing = require('../models/Standing');
const Achievement = require('../models/Achievement');
const { saveAchievements } = require('../utils/achievementUtils'); // saveAchievements fonksiyonunu içeri aktarı
const Goal = require('../models/Goal');

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

    // Sezon ID'sini yanıt içinde açıkça belirt
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


// Tüm maçları oynatan API
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

      // Standings güncellemesi
      const homeStanding = await Standing.findOneAndUpdate(
        { team: match.homeTeam._id, season: activeSeason._id },
        { $inc: { played: 1, goalsFor: homeScore, goalsAgainst: awayScore } },
        { new: true, upsert: true }
      );

      const awayStanding = await Standing.findOneAndUpdate(
        { team: match.awayTeam._id, season: activeSeason._id },
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

    // Başarıları kaydet
    console.log('Saving achievements...');
    await saveAchievements(activeSeason);
    // Sezonu tamamlanmış olarak işaretle
    activeSeason.isCompleted = true;
    await activeSeason.save();

    res.json({
      message: 'All matches for the active season played successfully. Season marked as completed.',
      playedMatches,
    });
  } catch (error) {
    console.error('Error processing all matches:', error.message);
    res.status(500).json({ error: 'Failed to process all matches.' });
  }
});


// Belirli haftanın maçlarını dönen API
router.get('/week/:week', async (req, res) => {
  const { week } = req.params;

  try {
    // Aktif sezonu kontrol et
    const activeSeason = await Season.findOne({ isCompleted: false });

    if (!activeSeason) {
      return res.status(404).json({ error: 'No active season found.' });
    }

    // Aktif sezonun fikstürünü getir
    const fixture = await Fixture.findOne({ season: activeSeason._id })
      .populate('matches.homeTeam', 'name')
      .populate('matches.awayTeam', 'name')
      .exec();

    if (!fixture) {
      return res.status(404).json({ error: 'No fixture found for the active season.' });
    }

    // Belirtilen haftanın maçlarını filtrele
    const weekMatches = fixture.matches.filter(match => match.week === parseInt(week));

    if (!weekMatches.length) {
      return res.status(404).json({ error: `No matches found for week ${week} in the active season.` });
    }

    const matchesWithDetails = await Promise.all(
      weekMatches.map(async (match) => {
        const homeTeam = match.homeTeam ? match.homeTeam.name : 'Bay';
        const awayTeam = match.awayTeam ? match.awayTeam.name : 'Bay';

        // Skor ve maç durumu
        const score = match.homeScore !== null && match.awayScore !== null
          ? `${match.homeScore} - ${match.awayScore}`
          : 'Oynanmadı';

        return {
          matchId: match._id,
          week: match.week,
          homeTeam,
          awayTeam,
          matchDate: match.matchDate || 'TBD',
          score,
          seasonId: activeSeason._id, // Sezon ID'si
          seasonNumber: activeSeason.seasonNumber, // Sezon numarası
        };
      })
    );

    res.json(matchesWithDetails);
  } catch (error) {
    console.error('Error fetching matches for week:', error.message);
    res.status(500).json({ error: 'Failed to fetch matches for the week.' });
  }
});


// Belirli sezon numarasına göre haftanın maçlarını dönen API
router.get('/season/:seasonNumber/week/:week', async (req, res) => {
  const { seasonNumber, week } = req.params;

  try {
    // Belirtilen sezonu bul
    const season = await Season.findOne({ seasonNumber: parseInt(seasonNumber) });
    if (!season) {
      return res.status(404).json({ error: `Season with number ${seasonNumber} not found.` });
    }

    // Belirtilen sezonun fikstürünü getir
    const fixture = await Fixture.findOne({ season: season._id })
      .populate('matches.homeTeam', 'name')
      .populate('matches.awayTeam', 'name');

    if (!fixture) {
      return res.status(404).json({ error: 'No fixture found for the specified season.' });
    }

    // Haftanın maçlarını filtrele
    const weekMatches = fixture.matches.filter(match => match.week === parseInt(week));
    if (!weekMatches.length) {
      return res.status(404).json({ error: `No matches found for week ${week} in season ${seasonNumber}.` });
    }

    const matchesWithDetails = await Promise.all(
      weekMatches.map(async (match) => {
        const homeTeam = match.homeTeam ? match.homeTeam.name : 'Bay';
        const awayTeam = match.awayTeam ? match.awayTeam.name : 'Bay';

        // Maç Skoru
        const score =
          match.homeScore !== null && match.awayScore !== null
            ? `${match.homeScore} - ${match.awayScore}`
            : 'Oynanmadı';

        // Golleri al
        const goals = await Goal.find({ match: match._id }).sort('minute').lean();
        const goalDetails = goals.map(
          (goal) =>
            `${goal.minute}' ${goal.playerName} (${goal.teamName})`
        );

        // Pretty Tarih Formatı
        const formattedDate = match.matchDate
          ? new Date(match.matchDate).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).replace(',', '')
          : 'TBD';

        return {
          matchSummary: `${homeTeam} : ${score} : ${awayTeam}`,
          date: formattedDate,
          goals: goalDetails,
        };
      })
    );

    res.json(matchesWithDetails);
  } catch (error) {
    console.error('Error fetching matches for week:', error.message);
    res.status(500).json({ error: 'Failed to fetch matches for the week.' });
  }
});

//all matches
router.get('/all-matches', async (req, res) => {
  try {
    const fixtures = await Fixture.find()
      .populate('season', 'seasonNumber') // Sezon bilgilerini getir
      .populate('matches.homeTeam', 'name')
      .populate('matches.awayTeam', 'name');

    if (!fixtures.length) {
      return res.status(404).json({ error: 'No matches found.' });
    }

    const allMatches = fixtures.flatMap(fixture =>
      fixture.matches.map(match => ({
        matchId: match._id,
        week: match.week,
        homeTeam: match.homeTeam ? match.homeTeam.name : 'Bay',
        awayTeam: match.awayTeam ? match.awayTeam.name : 'Bay',
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        matchDate: match.matchDate || 'TBD',
        seasonId: fixture.season._id, // Sezon ID'sini ekle
        seasonNumber: fixture.season.seasonNumber, // Sezon numarasını ekle
      }))
    );

    res.json(allMatches);
  } catch (error) {
    console.error('Error fetching all matches:', error.message);
    res.status(500).json({ error: 'Failed to fetch all matches.' });
  }
});

//season-matches
router.get('/season-matches', async (req, res) => {
  try {
    const activeSeason = await Season.findOne({ isCompleted: false });

    if (!activeSeason) {
      return res.status(404).json({ error: 'No active season found.' });
    }

    const fixture = await Fixture.findOne({ season: activeSeason._id })
      .populate('matches.homeTeam', 'name')
      .populate('matches.awayTeam', 'name');

    if (!fixture) {
      return res.status(404).json({ error: 'No matches found for the active season.' });
    }

    const seasonMatches = fixture.matches.map(match => ({
      matchId: match._id,
      week: match.week,
      homeTeam: match.homeTeam ? match.homeTeam.name : 'Bay',
      awayTeam: match.awayTeam ? match.awayTeam.name : 'Bay',
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      matchDate: match.matchDate || 'TBD',
    }));

    res.json({
      seasonId: activeSeason._id,
      seasonNumber: activeSeason.seasonNumber,
      matches: seasonMatches,
    });
  } catch (error) {
    console.error('Error fetching active season matches:', error.message);
    res.status(500).json({ error: 'Failed to fetch active season matches.' });
  }
});

//season-matches-pretty
router.get('/season-matches-pretty', async (req, res) => {
  try {
    // Aktif sezonu bul
    const activeSeason = await Season.findOne({ isCompleted: false });

    if (!activeSeason) {
      return res.status(404).json({ error: 'No active season found.' });
    }

    // Aktif sezona ait fikstürü al
    const fixture = await Fixture.findOne({ season: activeSeason._id })
      .populate('matches.homeTeam', 'name')
      .populate('matches.awayTeam', 'name');

    if (!fixture || !fixture.matches.length) {
      return res.status(404).json({ error: 'No matches found for the active season.' });
    }

    // Maçları haftalara ve tarihlere göre gruplandır
    const matchesByWeek = fixture.matches.reduce((acc, match) => {
      const week = `Week ${match.week}`;

      if (!acc[week]) {
        acc[week] = [];
      }

      acc[week].push({
        homeTeam: match.homeTeam ? match.homeTeam.name : 'Bay',
        awayTeam: match.awayTeam ? match.awayTeam.name : 'Bay',
        date: new Date(match.matchDate).toLocaleDateString('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        time: new Date(match.matchDate).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false, // 24 saat formatı için
        }),
      });

      return acc;
    }, {});

    // Formatlı sonuç
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

//seasonId
router.get('/season-id/:seasonId', async (req, res) => {
  const { seasonId } = req.params;

  try {
    const fixture = await Fixture.findOne({ season: seasonId })
      .populate('matches.homeTeam', 'name')
      .populate('matches.awayTeam', 'name')
      .populate('season', 'seasonNumber'); // Sezon bilgisi için eklendi

    if (!fixture) {
      return res.status(404).json({ error: `No matches found for season ${seasonId}.` });
    }

    const seasonMatches = fixture.matches.map(match => ({
      matchId: match._id,
      week: match.week,
      homeTeam: match.homeTeam ? match.homeTeam.name : 'Bay',
      awayTeam: match.awayTeam ? match.awayTeam.name : 'Bay',
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      matchDate: match.matchDate || 'TBD',
      seasonId: fixture.season._id, // Sezon ID eklendi
      seasonNumber: fixture.season.seasonNumber, // Sezon numarası eklendi
    }));

    res.json(seasonMatches);
  } catch (error) {
    console.error(`Error fetching matches for season ${seasonId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch matches for the specified season.' });
  }
});

//seasonNumber
router.get('/:seasonNumber', async (req, res) => {
  const { seasonNumber } = req.params;

  try {
    // İlgili sezonu bul
    const season = await Season.findOne({ seasonNumber: parseInt(seasonNumber) });

    if (!season) {
      return res.status(404).json({ error: `No season found with season number ${seasonNumber}.` });
    }

    // Sezona ait fikstürü getir
    const fixture = await Fixture.findOne({ season: season._id })
      .populate('matches.homeTeam', 'name')
      .populate('matches.awayTeam', 'name');

    if (!fixture) {
      return res.status(404).json({ error: `No matches found for season number ${seasonNumber}.` });
    }

    const seasonMatches = fixture.matches.map(match => ({
      matchId: match._id,
      week: match.week,
      homeTeam: match.homeTeam ? match.homeTeam.name : 'Bay',
      awayTeam: match.awayTeam ? match.awayTeam.name : 'Bay',
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      matchDate: match.matchDate || 'TBD',
      seasonId: season._id, // Sezon ID eklendi
      seasonNumber: season.seasonNumber, // Sezon numarası eklendi
    }));

    res.json(seasonMatches);
  } catch (error) {
    console.error(`Error fetching matches for season number ${seasonNumber}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch matches for the specified season number.' });
  }
});

module.exports = router;