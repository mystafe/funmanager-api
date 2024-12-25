require('dotenv').config(); // Çevre değişkenlerini yükler
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const loadInitialData = require('./utils/loadInitialData');
const mongoose = require('mongoose');
const resetInitialData = require('./utils/resetInitialData');
const { getTeamsWithFirstEleven, getTeamsWithFirstElevenPretty } = require('./utils/statistics');
const calculateTeamStrength = require('./utils/calculateTeamStrengths');
const app = express();

const mode = 1; // 0: no data, 1: initiate data
// Middleware
app.use(express.json()); // JSON desteği
app.use(cors()); // CORS desteği

// MongoDB bağlantısı ve başlangıç verilerinin yüklenmesi
const startServer = async () => {
  try {
    // Veritabanına bağlan
    await connectDB();

    if (mode === 0) {
      await resetInitialData();
    }
    // else if (mode === 3) await getTeamsWithFirstEleven();

    else {
      await loadInitialData();
    }


    // Sunucuyu başlat
    const PORT = process.env.PORT || 5001;
    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    // Graceful shutdown işlemleri
    const gracefulShutdown = async () => {
      console.log('Gracefully shutting down...');
      server.close(() => {
        console.log('HTTP server closed.');
      });
      await mongoose.disconnect(); // MongoDB bağlantısını kapat
      console.log('MongoDB connection closed.');
      process.exit(0); // Süreci kapat
    };

    process.on('SIGINT', gracefulShutdown); // Ctrl+C sinyali
    process.on('SIGTERM', gracefulShutdown); // Termination sinyali
  } catch (error) {
    console.error('Error starting server:', error.message);
    process.exit(1);
  }
};

// API rotaları
app.use('/api/teams', require('./routes/teams'));
app.use('/api/fixtures', require('./routes/fixtures')); // Fikstür rotası
app.use('/api/seasons', require('./routes/seasons')); // Sezon rotası
app.use('/api/reset', require('./routes/reset')); // Sıfırlama rotası
app.use('/api/match', require('./routes/match')); // Maç rotası
app.use('/api/alldata', require('./routes/allData')); // Oyuncu rotası
app.use('/api/standings', require('./routes/standings')); // Puan durumu rotası
app.use('/api/players', require('./routes/players')); // Oyuncu rotası
app.use('/api/goals', require('./routes/goals')); // Gol rotası
app.use('/api/achievements', require('./routes/achievement')); // Başarı rotası


// Sunucuyu başlat
startServer();




// (async () => {
//   try {
//     const teamsWithFirstElevenPretty = await getTeamsWithFirstElevenPretty();
//     console.log('Teams with First Eleven:', teamsWithFirstElevenPretty);
//   } catch (error) {
//     console.error('Error fetching teams with first eleven:', error.message);
//   }
// })();



// (async () => {
//   try {
//     const strengths = await calculateTeamStrength();
//     console.log('Team Strengths:', strengths);
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// })();
