const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Physical', 'Technical', 'Tactical', 'Mental', 'Set Pieces', 'Recovery'], // Antrenman tipi
  },
  defenceImpact: { type: Number, required: true }, // Defans etkisi
  attackImpact: { type: Number, required: true }, // Atak et
  formImpact: { type: Number, required: true }, // Form etkisi
  moraleImpact: { type: Number, required: true }, // Moral etkisi
  staminaImpact: { type: Number, required: true }, // Dayanıklılık etkisi
  cost: { type: Number, required: true }, // Maliyet
  level: { type: Number, required: true }, // Seviye

});



module.exports = mongoose.model('Training', trainingSchema);