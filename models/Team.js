const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Takım adı
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }], // Takıma bağlı oyuncular
  attackStrength: { type: Number, default: 0 }, // Atak gücü
  defenseStrength: { type: Number, default: 0 }, // Defans gücü
});

module.exports = mongoose.model('Team', teamSchema);


