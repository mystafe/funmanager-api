const Team = require('../models/Team');
const Player = require('../models/Player');
const Stadium = require('../models/Stadium');
const Training = require('../models/Training');
const initialTeams = require('../data/initialTeams');
const initialTrainings = require('../data/initialTrainings');
const tacticFormation = require('../data/tactics');
const determineFirstEleven = require('./determineFirstEleven');

const loadInitialData = async () => {
  try {
    const existingTeams = await Team.countDocuments();
    if (existingTeams > 0) {
      console.log('Initial data already exists. Skipping insert.');
      return;
    }

    const existingTrainings = await Training.countDocuments();
    if (existingTrainings === 0) {
      await Training.insertMany(initialTrainings);
      console.log('Training programs loaded.');
    } else {
      console.log('Training programs already exist. Skipping insert.');
    }

    for (const teamData of initialTeams) {
      const stadium = await Stadium.create({
        name: teamData.stadium.name,
        level: teamData.stadium.level,
        stadiumCapacity: teamData.stadium.stadiumCapacity,
        city: teamData.stadium.city,
      });

      const team = await Team.create({
        name: teamData.name,
        country: teamData.country,
        trainingFacilityLevel: teamData.trainingFacilityLevel,
        youthFacilityLevel: teamData.youthFacilityLevel,
        academyFacilityLevel: teamData.academyFacilityLevel,
        reputation: teamData.reputation,
        fans: teamData.fans,
        balance: teamData.balance,
        expenses: teamData.expenses,
        income: teamData.income,
        defaultTactic: teamData.defaultTactic,
        enteredCompetitions: teamData.enteredCompetitions,
        stadium: stadium._id,
      });

      const playerIds = await Promise.all(
        teamData.players.map(async (playerData) => {
          const player = await Player.create({ ...playerData, team: team._id });
          return player._id;
        })
      );

      team.players = playerIds;
      await team.save();

      // Oyuncular modelden alınmalı
      const players = await Player.find({ _id: { $in: playerIds } });

      // İlk 11 ve yedekleri belirleme
      const { playersInFirstEleven, playersOnBench, totalStrength } = determineFirstEleven(
        players,
        tacticFormation[team.defaultTactic]
      );

      team.playersInFirstEleven = playersInFirstEleven.map((p) => p._id);
      team.playersOnBench = playersOnBench.map((p) => p._id);
      team.attackStrength = totalStrength.attack;
      team.defenseStrength = totalStrength.defense;
      await team.save();

      console.log(`Team ${team.name} created with ${playerIds.length} players.`);
    }

    console.log('Initial teams, players, and stadiums loaded successfully.');
  } catch (error) {
    console.error('Error loading initial data:', error.message);
    throw error;
  }
};

module.exports = loadInitialData;