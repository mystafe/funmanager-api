const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Takım adı
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }], // Takıma bağlı oyuncular
  playersInFirstEleven: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }], // İlk 11 oyuncuları
  playersOnBench: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }], // Yedek oyuncular
  attackStrength: { type: Number, default: 0 }, // Atak gücü
  defenseStrength: { type: Number, default: 0 }, // Defans gücü
  stadium: { type: mongoose.Schema.Types.ObjectId, ref: 'Stadium' }, // Takımın stadyumu
  country: { type: String, required: true, default: 'Turkiye' }, // Ülke
  trainingFacilityLevel: { type: Number, required: true, default: 1 }, // Antrenman tesis seviyesi
  youthFacilityLevel: { type: Number, required: true, default: 1 }, // Gençlik tesis seviyesi
  academyFacilityLevel: { type: Number, required: true, default: 1 }, // Akademi tesis seviyesi
  reputation: { type: Number, required: true, default: 1 }, // Takımın itibarı
  fans: { type: Number, required: true, default: 100 }, // Taraftar sayısı
  balance: { type: Number, required: true, default: 1000000 }, // Bakiye
  expenses: { type: Number, required: true, default: 200000 }, // Giderler
  income: { type: Number, required: true, default: 200000 }, // Gelirler
  defaultTactic: { type: String, required: true, default: '4-4-2' }, // Varsayılan taktik
  // sponsors: [{ tkype: mongoose.Schema.Types.ObjectId, ref: 'Sponsor' }], // Takıma bağlı sponsorlar
  enteredCompetitions: [{ type: String }], // Katıldığı turnuvalar
});

module.exports = mongoose.model('Team', teamSchema);