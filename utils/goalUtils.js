const Goal = require('../models/Goal');

// Dakikayı rastgele oluşturmak için yardımcı fonksiyon
const generateMinute = () => {
  const weights = [15, 70, 15]; // İlk 15 dakika, orta 70 dakika, son 15 dakika
  const ranges = [1, 46, 76, 91]; // Aralıklar
  const randomWeight = Math.random() * 100;

  if (randomWeight <= weights[0]) {
    return Math.floor(Math.random() * (ranges[1] - ranges[0])) + ranges[0]; // İlk 15 dakika
  } else if (randomWeight <= weights[0] + weights[1]) {
    return Math.floor(Math.random() * (ranges[2] - ranges[1])) + ranges[1]; // 46-75 dakika
  } else {
    return Math.floor(Math.random() * (ranges[3] - ranges[2])) + ranges[2]; // 76-90 dakika
  }
};

// Gol kaydetme fonksiyonu
const saveGoal = async (player, team, match, season) => {
  try {
    if (!player || !team || !match || !season) {
      console.error('Invalid data provided for saving goal.');
      throw new Error('Invalid data provided for saving goal.');
    }

    // Rastgele dakika oluştur
    const minute = generateMinute();

    const goal = new Goal({
      player: player._id,
      playerName: player.name,
      team: team._id,
      teamName: team.name,
      match: match._id,
      season: season._id,
      seasonNumber: season.seasonNumber,
      week: match.week,
      minute: minute,
    });

    await goal.save();

    console.log(`Goal saved: Player: ${player.name}, Team: ${team.name}, Match ID: ${match._id}, Minute: ${minute}`);
  } catch (error) {
    console.error('Error saving goal:', error.message);
    throw new Error('Failed to save goal');
  }
};

module.exports = { saveGoal };