const mongoose = require('mongoose');

const stadiumSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'Ataturk Stadyumu' }, // Stadium name
  level: { type: Number, required: true, default: 2 }, // Stadium level
  stadiumCapacity: { type: Number, required: true, default: 1000 },
  city: { type: String, required: true, default: 'Unknown' },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: false },
}, { collection: 'stadiums' }); // Explicitly set the collection name

module.exports = mongoose.model('Stadium', stadiumSchema);