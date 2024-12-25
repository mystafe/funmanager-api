const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Sponsor name
  amount: { type: Number, required: true }, // Sponsorship amount
  contractEnd: { type: Number, required: true }, // Contract end year
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true }, // Reference to the team
});

module.exports = mongoose.model('Sponsor', sponsorSchema);