const Player = require('./models/Player');
const Team = require('./models/Team');

const addPlayersToTeam = async (teamId, playerIds) => {
  await Team.findByIdAndUpdate(teamId, { players: playerIds });
  console.log('Players added to team successfully.');
};

addPlayersToTeam('TEAM_ID', ['PLAYER_ID_1', 'PLAYER_ID_2']);