const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Takım adı
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }], // Takıma bağlı oyuncular
  attackStrength: { type: Number, default: 0 }, // Atak gücü
  defenseStrength: { type: Number, default: 0 }, // Defans gücü
  stadium: { type: mongoose.Schema.Types.ObjectId, ref: 'Stadium' }, // Takımın stadyumu
  country: { type: String, required: true }, // Ülke
  trainingFacilityLevel: { type: Number, required: true }, // Antrenman tesis seviyesi
  youthFacilityLevel: { type: Number, required: true }, // Gençlik tesis seviyesi
  academyFacilityLevel: { type: Number, required: true }, // Akademi tesis seviyesi
  reputation: { type: Number, required: true }, // Takımın itibarı
  fans: { type: Number, required: true }, // Taraftar sayısı
  balance: { type: Number, required: true }, // Bakiye
  expenses: { type: Number, required: true }, // Giderler
  income: { type: Number, required: true }, // Gelirler
  defaultTactic: { type: String, required: true }, // Varsayılan taktik
  // sponsors: [{ tkype: mongoose.Schema.Types.ObjectId, ref: 'Sponsor' }], // Takıma bağlı sponsorlar
  enteredCompetitions: [{ type: String }], // Katıldığı turnuvalar
});

module.exports = mongoose.model('Team', teamSchema);