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
    await Player.deleteMany({});
    await Season.deleteMany({});
    await Fixture.deleteMany({});
    await MatchResult.deleteMany({});
    await Standing.deleteMany({});
    await Goal.deleteMany({});
    await Achievement.deleteMany({});
    await Training.deleteMany({});
    await Sponsor.deleteMany({});
    await Stadium.deleteMany({});

    console.log('Database cleared successfully.');

    // Optionally, re-initialize data
    // await initializeData();
  } catch (error) {
    console.error('Error resetting database:', error.message);
  }
};



module.exports = resetInitialData;