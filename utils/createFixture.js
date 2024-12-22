const Fixture = require('../models/Fixture');

const createFixture = async (seasonId, teams) => {
  const matches = [];
  const totalTeams = teams.length;

  // Eğer takım sayısı tek ise "bay" için boş bir takım ekle
  if (totalTeams % 2 !== 0) {
    teams.push({ name: 'Bay', _id: null }); // "Bay" için temsilci
  }

  const totalRounds = teams.length - 1; // Toplam tur (her takım diğerleriyle 1 kez oynar)
  const halfTeams = teams.length / 2; // Yarı sayıda takım
  let week = 1;

  // İlk yarı fikstürünü oluştur
  const teamOrder = [...teams];
  for (let round = 0; round < totalRounds; round++) {
    for (let i = 0; i < halfTeams; i++) {
      const homeTeam = teamOrder[i];
      const awayTeam = teamOrder[teamOrder.length - 1 - i];

      // "Bay" olan takımları eşleşmeye dahil etme
      if (homeTeam._id && awayTeam._id) {
        matches.push({
          homeTeam: homeTeam._id,
          awayTeam: awayTeam._id,
          week: week,
          matchDate: new Date(Date.now() + (week - 1) * 7 * 24 * 60 * 60 * 1000),
        });
      }
    }

    // Takımları döndür (round-robin rotation)
    teamOrder.splice(1, 0, teamOrder.pop());
    week++;
  }

  // İkinci yarı fikstürünü oluştur (ilk yarının tam tersi)
  const secondHalfMatches = matches.map(match => ({
    homeTeam: match.awayTeam,
    awayTeam: match.homeTeam,
    week: match.week + totalRounds, // Haftayı toplam tur sayısına göre artır
    matchDate: new Date(
      Date.now() + (match.week + totalRounds - 1) * 7 * 24 * 60 * 60 * 1000
    ),
  }));

  // İlk yarı ve ikinci yarıyı birleştir
  matches.push(...secondHalfMatches);

  // Fikstürü kaydet
  const fixture = new Fixture({
    season: seasonId,
    matches,
  });

  await fixture.save();
  console.log('Fixture created successfully.');
  return fixture;
};

module.exports = createFixture;