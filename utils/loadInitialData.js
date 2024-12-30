const Team = require('../models/Team');
const Player = require('../models/Player');
const Stadium = require('../models/Stadium');
const Training = require('../models/Training');
const initialTeams = require('../data/initialTeams');
const initialTrainings = require('../data/initialTrainings');
const calculateTeamStrength = require('./calculateTeamStrengths');
const updateFirstEleven = require('./updateFirstEleven');

const loadInitialData = async () => {
  try {
    // Check if teams data already exists
    const existingTeams = await Team.countDocuments();
    if (existingTeams > 0) {
      console.log('Initial data already exists. Skipping insert.');
      // updateFirstEleven(); no need to update first eleven players no
      // console.log('First eleven players updated.');
      // const teamStrengths = await calculateTeamStrength(); no need to recalculate team strengths now
      // console.log('Team Strengths:', teamStrengths);
      return;
    }

    // Load training programs
    const existingTrainings = await Training.countDocuments();
    if (existingTrainings === 0) {
      await Training.insertMany(initialTrainings);
      console.log('Training programs loaded.');
    } else {
      console.log('Training programs already exist. Skipping insert.');
    }

    // Tactic formations
    const tacticFormation = {
      '4-4-2': { Goalkeeper: 1, Defence: 4, Midfield: 4, Forward: 2 },
      '3-5-2': { Goalkeeper: 1, Defence: 3, Midfield: 5, Forward: 2 },
      '4-3-3': { Goalkeeper: 1, Defence: 4, Midfield: 3, Forward: 3 },
      '3-4-3': { Goalkeeper: 1, Defence: 3, Midfield: 4, Forward: 3 },
      '4-5-1': { Goalkeeper: 1, Defence: 4, Midfield: 5, Forward: 1 },
      '4-2-4': { Goalkeeper: 1, Defence: 4, Midfield: 2, Forward: 4 },
      '5-3-2': { Goalkeeper: 1, Defence: 5, Midfield: 3, Forward: 2 },
    };

    for (const teamData of initialTeams) {
      // Create stadium
      const stadium = new Stadium({
        name: teamData.stadium.name,
        level: teamData.stadium.level,
        stadiumCapacity: teamData.stadium.stadiumCapacity,
        city: teamData.stadium.city,
      });
      await stadium.save();

      // Create team
      const team = new Team({
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
      await team.save();

      // Group players by position and assign team ID
      const positionGroups = { Goalkeeper: [], Defence: [], Midfield: [], Forward: [] };
      const playerIds = [];
      for (const playerData of teamData.players) {
        const player = new Player({ ...playerData, team: team._id }); // Takım ID'sini burada ekliyoruz
        await player.save();
        positionGroups[player.position]?.push(player);
        playerIds.push(player._id);
      }

      // Sort players within each position
      for (const position in positionGroups) {
        positionGroups[position].sort((a, b) => {
          const strengthA = a.attack * 1.3 + a.defense * 1.2 + a.goalkeeper * 1.5;
          const strengthB = b.attack * 1.3 + b.defense * 1.2 + b.goalkeeper * 1.5;
          return strengthB - strengthA;
        });
      }

      // Determine formation
      const formation = tacticFormation[teamData.defaultTactic];
      if (!formation) {
        console.warn(`Unknown tactic ${teamData.defaultTactic}. Skipping team ${teamData.name}.`);
        continue;
      }

      // Assign first eleven and bench players
      const playersInFirstEleven = [];
      for (const [position, count] of Object.entries(formation)) {
        playersInFirstEleven.push(...positionGroups[position].slice(0, count));
      }

      const remainingPlayers = Object.values(positionGroups)
        .flat()
        .filter((player) => !playersInFirstEleven.includes(player));
      const playersOnBench = remainingPlayers.slice(0, 7);

      // Update player flags
      await Player.updateMany(
        { _id: { $in: playersInFirstEleven.map((p) => p._id) } },
        { isFirstEleven: true, isMatchSquad: true }
      );
      await Player.updateMany(
        { _id: { $in: playersOnBench.map((p) => p._id) } },
        { isMatchSquad: true }
      );

      // Update team with players
      team.players = playerIds;
      team.playersInFirstEleven = playersInFirstEleven.map((p) => p._id);
      team.playersOnBench = playersOnBench.map((p) => p._id);
      await team.save();

      console.log(`Team ${team.name} created with ${playerIds.length} players.`);
    }

    console.log('Initial teams, players, and stadiums loaded.');

    // Calculate team strengths
    const teamStrengths = await calculateTeamStrength();
    console.log('Team Strengths:', teamStrengths);
  } catch (error) {
    console.error('Error loading initial data:', error.message);
    throw error;
  }
};

module.exports = loadInitialData;