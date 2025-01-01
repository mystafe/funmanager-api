/**
 * Calculate the contribution of a player based on their stats and position.
 * @param {Object} player - The player object.
 * @returns {Object} - Attack and defense contributions of the player.
 */
const calculatePlayerContribution = (player) => {
  const conditionFactor = (player.condition / 100) * (player.form / 10);

  // Weights for different positions
  const attackWeights = {
    Goalkeeper: 0,
    Defence: 0.2,
    Midfield: 1,
    Forward: 1.5,
  };

  const defenseWeights = {
    Goalkeeper: 1.5,
    Defence: 1.2,
    Midfield: 1,
    Forward: 0.1,
  };

  const attack = (player.attack || 0) * (attackWeights[player.position] || 0) * conditionFactor;
  const defense = (player.defense || 0) * (defenseWeights[player.position] || 0) * conditionFactor;

  return { attack, defense };
};

module.exports = calculatePlayerContribution;