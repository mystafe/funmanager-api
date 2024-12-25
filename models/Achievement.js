const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
  seasonNumber: { type: Number, required: true },
  topScorer: {
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    playerName: { type: String, required: true },
    goals: { type: Number, required: true },
  },
  champion: {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    teamName: { type: String, required: true },
  },
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);