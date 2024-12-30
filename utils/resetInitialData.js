const mongoose = require('mongoose');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Fixture = require('../models/Fixture');
const Season = require('../models/Season');
const Stadium = require('../models/Stadium');
const Sponsor = require('../models/Sponsor');
const Standing = require('../models/Standing');
const MatchResult = require('../models/MatchResult');
const Goal = require('../models/Goal');
const Achievement = require('../models/Achievement');
const Training = require('../models/Training');

const resetInitialData = async () => {
  try {
    console.log('Starting database reset...');

    // Clear all collections
    await deleteInitialData();

    // Optionally, re-initialize data
    // await initializeData();
  } catch (error) {
    console.error('Error resetting database:', error.message);
  }
};

const deleteInitialData = async () => {
  try {
    console.log('Starting database delete...');

    // Clear all collections
    await Team.deleteMany({});
    console.log('Teams collection cleared.');

    await Player.deleteMany({});
    console.log('Players collection cleared.');

    await Fixture.deleteMany({});
    console.log('Fixtures collection cleared.');

    await Season.deleteMany({});
    console.log('Seasons collection cleared.');

    await Stadium.deleteMany({});
    console.log('Stadiums collection cleared.');

    await Sponsor.deleteMany({});
    console.log('Sponsors collection cleared.');

    await Standing.deleteMany({});
    console.log('Standings collection cleared.');

    await MatchResult.deleteMany({});
    console.log('Match results collection cleared.');

    await Goal.deleteMany({});
    console.log('Goals collection cleared.');

    await Achievement.deleteMany({});
    console.log('Achievements collection cleared.');

    await Training.deleteMany({});
    console.log('Trainings collection cleared.');

    console.log('Database cleared successfully.');

    // Optionally, re-initialize data
    // await initializeData();
  } catch (error) {
    console.error('Error resetting database:', error.message);
  }
};



module.exports = resetInitialData;