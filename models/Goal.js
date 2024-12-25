const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
  seasonNumber: { type: Number, required: true },
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Fixture', required: true },
  week: { type: Number, required: true }, // Maç haftası
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  playerName: { type: String, required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  teamName: { type: String, required: true },
  minute: { type: Number, required: false, default: null }, // Golün dakikası
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);