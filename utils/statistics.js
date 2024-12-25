const Goal = require('../models/Goal');
const Team = require('../models/Team');
const Player = require('../models/Player');

const getMostGoalsMinute = async () => {
  try {
    const goals = await Goal.find({}, 'minute');
    if (!goals.length) {
      console.log('No goals found in the database.');
      return null;
    }

    const minuteCount = goals.reduce((acc, goal) => {
      const minute = goal.minute;
      acc[minute] = (acc[minute] || 0) + 1;
      return acc;
    }, {});

    const mostGoalsMinute = Object.entries(minuteCount).reduce(
      (max, [minute, count]) => (count > max.count ? { minute, count } : max),
      { minute: null, count: 0 }
    );

    return {
      minute: mostGoalsMinute.minute,
      count: mostGoalsMinute.count,
    };
  } catch (error) {
    console.error('Error calculating most goals minute:', error.message);
    throw new Error('Failed to calculate most goals minute.');
  }
};

const getTopThreeGoalMinutes = async () => {
  try {
    const goals = await Goal.find({}, 'minute');
    if (!goals.length) {
      console.log('No goals found in the database.');
      return null;
    }

    const minuteCount = goals.reduce((acc, goal) => {
      const minute = goal.minute;
      acc[minute] = (acc[minute] || 0) + 1;
      return acc;
    }, {});

    const topThreeMinutes = Object.entries(minuteCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([minute, count]) => ({ minute: parseInt(minute), count }));

    return topThreeMinutes;
  } catch (error) {
    console.error('Error calculating top three goal minutes:', error.message);
    throw new Error('Failed to calculate top three goal minutes.');
  }
};

const getTeamsWithFirstEleven = async () => {
  try {
    const teams = await Team.find({})
      .populate({
        path: 'playersInFirstEleven',
        select: 'name position attack defense goalkeeper stamina condition form',
      })
      .select('name playersInFirstEleven');
    console.log('\nTeams with First Eleven:');
    console.table(teams.map(team => ({
      Team: team.name,
      Players: team.playersInFirstEleven.length,
    })));
    return teams;
  } catch (error) {
    console.error('Error fetching teams with first eleven:', error.message);
    throw error;
  }
};

const getTeamsWithFirstElevenPretty = async () => {
  try {
    const teamsWithFirstEleven = await getTeamsWithFirstEleven();

    teamsWithFirstEleven.forEach((team) => {
      console.log(`\nTeam: ${team.name}`);
      console.log('First Eleven:');
      team.playersInFirstEleven.forEach((player, index) => {
        console.log(
          `${index + 1}. Name: ${player.name}, Position: ${player.position}, Attack: ${player.attack}, Defense: ${player.defense}, Goalkeeper: ${player.goalkeeper}, Stamina: ${player.stamina}, Condition: ${player.condition}, Form: ${player.form}`
        );
      });
    });
  } catch (error) {
    console.error('Error fetching pretty first eleven:', error.message);
  }
};

module.exports = { getMostGoalsMinute, getTopThreeGoalMinutes, getTeamsWithFirstEleven, getTeamsWithFirstElevenPretty };