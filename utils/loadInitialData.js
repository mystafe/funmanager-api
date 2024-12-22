const Team = require('../models/Team');
const Player = require('../models/Player');
const initialTeams = require('../data/initialTeams'); // Takım verilerini içeren dosya
const calculateTeamStrengths = require('./calculateTeamStrengths');
const loadInitialData = async () => {
  try {
    // Eğer veri zaten varsa, işlemi atla
    const existingTeams = await Team.countDocuments();
    if (existingTeams > 0) {
      console.log('Initial data already exists. Skipping insert.');
      return;
    }

    // Takımları ve oyuncuları yükle
    for (const teamData of initialTeams) {
      // Takımı oluştur
      const team = new Team({ name: teamData.name });
      await team.save();

      // Oyuncuları oluştur ve takıma bağla
      for (const playerData of teamData.players) {
        const player = new Player({
          ...playerData,
          team: team._id,
        });
        await player.save();
      }
    }

    console.log('Initial teams and players loaded.');

    // Takım güçlerini hesapla
    await calculateTeamStrengths();
    console.log('Team strengths calculated.');
  } catch (error) {
    console.error('Error loading initial data:', error.message);
  }
};

module.exports = loadInitialData;