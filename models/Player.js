const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  position: {
    type: String,
    required: true,
    enum: ['Goalkeeper', 'Defence', 'Midfield', 'Forward'],
  },
  attack: { type: Number, required: true, min: 0, max: 100, default: 50 },
  defense: { type: Number, required: true, min: 0, max: 100, default: 50 },
  goalkeeper: { type: Number, required: true, min: 0, max: 100, default: 10 },
  stamina: { type: Number, required: true, min: 0, max: 100, default: 70 },
  condition: { type: Number, required: true, min: 0, max: 100, default: 100 },
  wage: { type: Number, required: true },
  loanTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  form: { type: Number, default: 7.0 },
  injury: { type: Number, default: 0 },
  suspension: { type: Number, default: 0 },
  redCard: { type: Number, default: 0 },
  yellowCard: { type: Number, default: 0 },
  goals: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  cleanSheet: { type: Number, default: 0 },
  motm: { type: Number, default: 0 },
  rating: { type: Number, default: 6.0 },
  apps: { type: Number, default: 0 },
  subbed: { type: Number, default: 0 },
  minutes: { type: Number, default: 0 },
  contractEnd: { type: Number, required: true },
  value: {
    type: Number,
    required: true,
    default: function () {
      return this.attack * 10000;
    },
  },
  age: { type: Number, required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
});

playerSchema.post('save', async function (doc, next) {
  const Team = require('./Team');
  try {
    await Team.findByIdAndUpdate(doc.team, { $addToSet: { players: doc._id } });
    next();
  } catch (err) {
    next(err);
  }
});

playerSchema.virtual('isInjured').get(function () {
  return this.injury > 0;
});

module.exports = mongoose.model('Player', playerSchema);