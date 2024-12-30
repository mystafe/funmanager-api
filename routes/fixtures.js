const express = require('express');
const Season = require('../models/Season');
const Team = require('../models/Team');
const createFixture = require('../utils/createFixture');
const Fixture = require('../models/Fixture');
const router = express.Router();
const Goal = require('../models/Goal');
const loadInitialData = require('../utils/loadInitialData');
const MatchResult = require('../models/MatchResult');


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
    let teams = await Team.find();
    if (teams.length < 2) {

      // Eğer takım sayısı 2'den azsa bilgi ver ve dataları tekrar yükle
      await loadInitialData();
      console.log('Not enough teams available. Data reloaded.');
    }
    teams = await Team.find();

    if (teams.length < 2) {
      return res.status(400).json({ error: 'Not enough teams available. Please add more teams.' });
    }
    console.log(`Number of teams available: ${teams.length}`);

    // Fikstürün daha önce oluşturulup oluşturulmadığını kontrol et
    const existingFixture = await Fixture.findOne({ season: activeSeason._id });
    if (existingFixture) {
      return res.status(400).json({
        error: `A fixture already exists for Season ${activeSeason.seasonNumber}.`,
      });
    }

    // Fikstürü oluştur
    let fixture;
    try {
      fixture = await createFixture(activeSeason._id, teams);
    } catch (fixtureError) {
      console.error('Error creating fixture:', fixtureError.message);
      return res.status(500).json({ error: 'Failed to create fixture.' });
    }

    // Yanıtı döndür
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
    const weekMatches = fixture.matches.filter((match) => match.week === parseInt(week));
    if (!weekMatches.length) {
      return res.status(404).json({
        error: `No matches found for week ${week} in season ${seasonNumber}.`,
      });
    }

    const matchesWithDetails = await Promise.all(
      weekMatches.map(async (match) => {
        try {
          const homeTeam = match.homeTeam && match.homeTeam.name ? match.homeTeam.name : 'Bay';
          const awayTeam = match.awayTeam && match.awayTeam.name ? match.awayTeam.name : 'Bay';

          const score =
            match.homeScore !== null && match.awayScore !== null
              ? `${match.homeScore} - ${match.awayScore}`
              : 'Oynanmadı';

          // `goals` alanını önce Fixture modelinden al
          let goalDetails = [];
          if (match.goals && match.goals.length) {
            goalDetails = match.goals.map(
              (goal) => `${goal.minute}' ${goal.playerName} (${goal.teamName})`
            );
          } else {
            // Eğer Fixture modelinde `goals` yoksa Goal koleksiyonundan al
            const goals = await Goal.find({ match: match._id }).sort('minute').lean();
            goalDetails = goals.map(
              (goal) => `${goal.minute}' ${goal.playerName} (${goal.teamName})`
            );
          }

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
        } catch (err) {
          console.error(`Error processing match with ID: ${match._id}`, err.message);
          return { error: `Failed to process match with ID: ${match._id}` };
        }
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

//season-result-pretty-seasonNumber
router.get('/season-matches-pretty/:seasonNumber', async (req, res) => {
  try {
    const { seasonNumber } = req.params;

    const activeSeason = await Season.findOne({ seasonNumber: parseInt(seasonNumber) });

    if (!activeSeason) {
      return res.status(404).json({ error: 'No season found.' });
    }

    const fixtures = await MatchResult.find({ season: activeSeason._id })
      .populate('match.homeTeam', 'name')
      .populate('match.awayTeam', 'name')
      .populate('goals.scorer', 'name')
      .populate('goals.team', 'name');


    if (!fixtures || fixtures.length === 0) {
      return res.status(404).json({ error: 'No matches found for the season.' });
    }

    const matchesByWeek = fixtures.reduce((acc, fixture) => {
      const week = `Week ${new Date(fixture.matchDate).getWeek()}`; // Haftaya göre gruplama

      if (!acc[week]) {
        acc[week] = [];
      }

      acc[week].push({
        homeTeam: fixture.match.homeTeam.name,
        awayTeam: fixture.match.awayTeam.name,
        homeScore: fixture.homeScore,
        awayScore: fixture.awayScore,
        winner: fixture.winner ? fixture.winner.name : 'Draw',
        date: new Date(fixture.matchDate).toLocaleDateString('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        time: new Date(fixture.matchDate).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        goals: fixture.goals.map((goal) => ({
          scorer: goal.scorer.name,
          team: goal.team.name,
          minute: goal.minute,

        })),



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

//season-matches-pretty
router.get('/season-matches-pretty', async (req, res) => {
  try {
    // Find the active season
    const activeSeason = await Season.findOne({ isCompleted: false });

    if (!activeSeason) {
      return res.status(404).json({ error: 'No active season found.' });
    }

    // Retrieve the fixture for the active season
    const fixture = await Fixture.findOne({ season: activeSeason._id })
      .populate({
        path: 'matches.homeTeam',
        select: 'name stadium',
        populate: {
          path: 'stadium',
          model: 'Stadium', // Ensure the model name matches your Stadium model
          select: 'name city',
        },
      })
      .populate('matches.awayTeam', 'name');

    if (!fixture || !fixture.matches.length) {
      return res.status(404).json({ error: 'No matches found for the active season.' });
    }

    // Group and sort matches by week
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
          hour12: false, // 24-hour format
        }),
        stadium: match.homeTeam?.stadium?.name || 'Unknown Stadium',
        city: match.homeTeam?.stadium?.city || 'Unknown City',
      });

      return acc;
    }, {});

    // Sort matches within each week by date and time
    Object.keys(matchesByWeek).forEach((week) => {
      matchesByWeek[week].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA - dateB;
      });
    });

    // Format the response
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