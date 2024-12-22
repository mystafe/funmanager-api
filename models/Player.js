const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  attack: { type: Number, required: true },
  defense: { type: Number, required: true },
  goalkeeper: { type: Number, required: true },
  goals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fixture' }], // Gol attığı maçların ID'leri
});

playerSchema.post('save', async function (doc, next) {
  const Team = require('./Team'); // Team modelini import et
  try {
    await Team.findByIdAndUpdate(doc.team, { $addToSet: { players: doc._id } }); // Oyuncuyu takıma ekle
    next();
  } catch (err) {
    next(err);
  }
});


module.exports = mongoose.model('Player', playerSchema);