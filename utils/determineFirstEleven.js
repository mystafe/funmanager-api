const calculatePlayerContribution = require('./calculatePlayerContribution');

/**
 * Determines the first eleven, bench players, and total strength for a team.
 * @param {Array} players - List of players in the team.
 * @param {Object} tactic - Tactic formation (e.g., { Goalkeeper: 1, Defence: 4, Midfield: 4, Forward: 2 }).
 * @returns {Object} - First eleven, bench players, and total strength.
 */
const determineFirstEleven = (players, tactic) => {
  if (!Array.isArray(players)) {
    throw new Error('Players must be an array.');
  }

  if (typeof tactic !== 'object' || tactic === null) {
    throw new Error('Tactic must be a valid object.');
  }

  // Group players by position
  const positionGroups = { Goalkeeper: [], Defence: [], Midfield: [], Forward: [] };

  players.forEach((player) => {
    if (positionGroups[player.position]) {
      try {
        // Calculate player strength once and store it
        const contribution = calculatePlayerContribution(player);
        player.strength = contribution.attack + contribution.defense;
        positionGroups[player.position].push(player);
      } catch (error) {
        console.error(`Error calculating contribution for player ${player.name}: ${error.message}`);
      }
    } else {
      console.warn(`Player ${player.name} has an invalid position: ${player.position}`);
    }
  });

  // Sort players by strength within each position
  for (const position in positionGroups) {
    positionGroups[position].sort((a, b) => b.strength - a.strength);
  }

  // Select first eleven players based on tactic
  const playersInFirstEleven = [];
  for (const [position, count] of Object.entries(tactic)) {
    if (positionGroups[position]?.length >= count) {
      playersInFirstEleven.push(...positionGroups[position].slice(0, count));
    } else {
      console.warn(
        `Not enough players for position ${position}. Expected ${count}, but found ${positionGroups[position]?.length || 0}.`
      );
      playersInFirstEleven.push(...(positionGroups[position] || []));
    }
  }

  // Select bench players
  const remainingPlayers = Object.values(positionGroups)
    .flat()
    .filter((player) => !playersInFirstEleven.includes(player));
  const playersOnBench = remainingPlayers.slice(0, 7);

  // Calculate total strength
  const totalStrength = playersInFirstEleven.reduce(
    (totals, player) => {
      const contribution = calculatePlayerContribution(player);
      totals.attack += contribution.attack;
      totals.defense += contribution.defense;
      return totals;
    },
    { attack: 0, defense: 0 }
  );

  return { playersInFirstEleven, playersOnBench, totalStrength };
};

module.exports = determineFirstEleven;