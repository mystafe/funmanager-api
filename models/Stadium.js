const mongoose = require('mongoose');

const stadiumSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Stadium name
  level: { type: Number, required: true, default: 2 }, // Stadium level
  stadiumCapacity: { type: Number, required: true }, // Capacity of the stadium
  city: { type: String, required: true }, // City where the stadium is located
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true }, // Reference to the team
});

module.exports = mongoose.model('Stadium', stadiumSchema);