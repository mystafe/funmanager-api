const mongoose = require('mongoose');

const matchResultSchema = new mongoose.Schema({
  season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
  match: {
    homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  },
  homeScore: { type: Number, required: true },
  awayScore: { type: Number, required: true },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }, // Kazanan takım
  matchDate: { type: Date, required: true },
});

module.exports = mongoose.model('MatchResult', matchResultSchema);