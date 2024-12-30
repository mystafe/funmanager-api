const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
    seasonNumber: { type: Number, required: true },
    topScorers: [
      {
        player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
        playerName: { type: String, required: true },
        goals: { type: Number, required: true },
      },
    ], // Allows multiple top scorers in case of ties
    champion: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }, // Optional field for champion team
  },
  { timestamps: true }
);

module.exports = mongoose.model('Achievement', achievementSchema);