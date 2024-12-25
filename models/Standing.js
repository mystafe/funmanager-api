const mongoose = require('mongoose');

const standingSchema = new mongoose.Schema({
  season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  played: { type: Number, default: 0, min: 0 },
  wins: { type: Number, default: 0, min: 0 },
  draws: { type: Number, default: 0, min: 0 },
  losses: { type: Number, default: 0, min: 0 },
  goalsFor: { type: Number, default: 0, min: 0 },
  goalsAgainst: { type: Number, default: 0, min: 0 },
  goalDifference: { type: Number, default: 0 }, // Opsiyonel, her seferinde hesaplanabilir
  points: { type: Number, default: 0, min: 0 },
});

standingSchema.index({ season: 1, team: 1 }, { unique: true });

standingSchema.virtual('calculatedGoalDifference').get(function () {
  return this.goalsFor - this.goalsAgainst;
});

module.exports = mongoose.model('Standing', standingSchema);