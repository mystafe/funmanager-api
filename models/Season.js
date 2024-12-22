const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  seasonNumber: { type: Number, required: true, unique: true },
  isCompleted: { type: Boolean, default: false }, // Sezon tamamlanma durumu
});

module.exports = mongoose.model('Season', seasonSchema);