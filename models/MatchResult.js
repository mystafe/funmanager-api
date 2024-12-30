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

// Doğrulama için bir ön middleware
matchResultSchema.pre('save', function (next) {
  if (this.homeScore < 0 || this.awayScore < 0) {
    next(new Error('Scores cannot be negative.'));
  } else {
    next();
  }
});

// İsteğe bağlı sanal alan (Virtual Field): Winner Team Name
matchResultSchema.virtual('winnerName').get(function () {
  return this.homeScore > this.awayScore
    ? 'Home Team'
    : this.homeScore < this.awayScore
      ? 'Away Team'
      : 'Draw';
});

// Model export ediliyor
module.exports = mongoose.model('MatchResult', matchResultSchema);