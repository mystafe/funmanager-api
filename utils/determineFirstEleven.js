const determineFirstEleven = (players, tactic) => {
  const positionGroups = { Goalkeeper: [], Defence: [], Midfield: [], Forward: [] };

  // Oyuncuları pozisyonlara göre gruplandır ve güçlerini hesapla
  players.forEach((player) => {
    player.strength = calculatePlayerContribution(player).attack + calculatePlayerContribution(player).defense;
    positionGroups[player.position]?.push(player);
  });

  // Pozisyon gruplarını sırala
  for (const position in positionGroups) {
    positionGroups[position].sort((a, b) => b.strength - a.strength);
  }

  // İlk 11 oyuncularını seç
  const playersInFirstEleven = [];
  for (const [position, count] of Object.entries(tactic)) {
    playersInFirstEleven.push(...positionGroups[position].slice(0, count));
  }

  // Yedek oyuncuları seç
  const remainingPlayers = Object.values(positionGroups)
    .flat()
    .filter((player) => !playersInFirstEleven.includes(player));
  const playersOnBench = remainingPlayers.slice(0, 7);

  // Toplam gücü hesapla
  const totalStrength = playersInFirstEleven.reduce((sum, player) => sum + player.strength, 0);

  return { playersInFirstEleven, playersOnBench, totalStrength };
};