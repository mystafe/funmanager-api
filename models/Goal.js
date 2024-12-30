const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
    seasonNumber: { type: Number, required: true },
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Fixture', required: true },
    week: { type: Number, required: true }, // Maç haftası
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    minute: { type: Number, required: true }, // Golün dakikası
    playerName: { type: String, required: true }, // Oyuncu adı (denormalize alan)
    teamName: { type: String, required: true }, // Takım adı (denormalize alan)
  },
  { timestamps: true }
);

// Middleware to populate `playerName` and `teamName` if not provided
goalSchema.pre('save', async function (next) {
  try {
    if (!this.playerName || !this.teamName) {
      const Player = mongoose.model('Player');
      const Team = mongoose.model('Team');

      if (!this.playerName) {
        const player = await Player.findById(this.player);
        if (player) {
          this.playerName = player.name;
        } else {
          throw new Error(`Player with ID ${this.player} not found.`);
        }
      }

      if (!this.teamName) {
        const team = await Team.findById(this.team);
        if (team) {
          this.teamName = team.name;
        } else {
          throw new Error(`Team with ID ${this.team} not found.`);
        }
      }
    }
    next();
  } catch (error) {
    console.error('Error in goalSchema pre-save middleware:', error.message);
    next(error);
  }
});

module.exports = mongoose.model('Goal', goalSchema);