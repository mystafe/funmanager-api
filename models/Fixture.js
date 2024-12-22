const mongoose = require('mongoose');

const fixtureSchema = new mongoose.Schema({
  season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
  matches: [
    {
      homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
      awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
      matchDate: { type: Date, required: true },
      week: { type: Number, required: true },
      homeScore: { type: Number, default: null }, // Ev sahibi skoru (null başlangıç)
      awayScore: { type: Number, default: null }, // Deplasman skoru (null başlangıç)
    },
  ],
});

module.exports = mongoose.model('Fixture', fixtureSchema);