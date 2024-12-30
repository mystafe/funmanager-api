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
  form: { type: Number, min: 0, max: 10, default: 7.0 }, // Updated form to have a max value
  injury: { type: Number, min: 0, default: 0 },
  suspension: { type: Number, min: 0, default: 0 },
  redCard: { type: Number, min: 0, default: 0 },
  yellowCard: { type: Number, min: 0, default: 0 },
  goals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: [] }], // Goal object references
  assists: { type: Number, min: 0, default: 0 },
  cleanSheet: { type: Number, min: 0, default: 0 },
  motm: { type: Number, min: 0, default: 0 }, // Man of the Match awards
  rating: { type: Number, min: 0, max: 10, default: 0 },
  apps: { type: Number, min: 0, default: 0 }, // Appearances
  subbed: { type: Number, min: 0, default: 0 },
  minutes: { type: Number, min: 0, default: 0 },
  contractEnd: { type: Number, required: true },
  value: {
    type: Number,
    required: true,
    default: function () {
      return this.attack * 10000;
    },
  },
  age: { type: Number, required: true, min: 16, max: 40 }, // Added realistic age constraints
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null, index: true },
  isFirstEleven: { type: Boolean, default: false }, // Indicates if the player is in the starting lineup
  isMatchSquad: { type: Boolean, default: false }, // Indicates if the player is in the matchday squad (e.g., 18-man squad)
});

// Post-save hook to update the team's players array
playerSchema.post('save', async function (doc, next) {
  if (doc.team) {
    try {
      const Team = require('./Team');
      await Team.findByIdAndUpdate(doc.team, { $addToSet: { players: doc._id } });
    } catch (err) {
      console.error(`Error updating team players: ${err.message}`);
    }
  }
  next();
});

// Virtual property to check if a player is injured
playerSchema.virtual('isInjured').get(function () {
  return this.injury > 0;
});

// Pre-remove hook to clean up player references in the team
playerSchema.pre('remove', async function (next) {
  if (this.team) {
    const Team = require('./Team');
    try {
      await Team.findByIdAndUpdate(this.team, { $pull: { players: this._id } });
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Player', playerSchema);