const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
    seasonNumber: { type: Number, required: true },
    topScorers: [
      {
        player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
        playerName: { type: String, required: true },
        teamName: { type: String, required: true }, // Takım ismi
        goals: { type: Number, required: true }, // Gol sayısı
      },
    ], // Gol kralları
    champion: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }, // Şampiyon takım
  },
  { timestamps: true }
);

module.exports = mongoose.model('Achievement', achievementSchema);