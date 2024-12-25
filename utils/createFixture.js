const Fixture = require('../models/Fixture');

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const createFixture = async (seasonId, teams) => {
  const matches = [];
  const totalTeams = teams.length;

  // Eğer takım sayısı tek ise "Bay" için boş bir takım ekle
  if (totalTeams % 2 !== 0) {
    teams.push({ name: 'Bay', _id: null }); // "Bay" için temsilci
  }

  // Takımları rastgele sırayla yerleştir
  shuffleArray(teams);

  const totalRounds = teams.length - 1; // Toplam tur (her takım diğerleriyle 1 kez oynar)
  const halfTeams = teams.length / 2; // Yarı sayıda takım
  let week = 1;

  // Rastgele günler ve saatler için tarih oluşturma yardımcı fonksiyonu
  const getRandomDateTime = (week, daySpread) => {
    const baseDate = new Date(Date.now() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
    const randomDaysOffset = Math.floor(Math.random() * daySpread); // Haftanın farklı günlerine yay
    baseDate.setDate(baseDate.getDate() + randomDaysOffset);

    // Rastgele saat seçimi (16:00, 19:00, 22:00)
    const times = [16, 19, 22];
    const randomHour = times[Math.floor(Math.random() * times.length)];
    baseDate.setHours(randomHour, 0, 0, 0);

    return baseDate;
  };

  // İlk yarı fikstürünü oluştur
  const teamOrder = [...teams];
  let isHomeFirst = true; // İlk hafta ev sahibi/deplasman sırasını belirler

  for (let round = 0; round < totalRounds; round++) {
    for (let i = 0; i < halfTeams; i++) {
      const homeTeam = isHomeFirst ? teamOrder[i] : teamOrder[teamOrder.length - 1 - i];
      const awayTeam = isHomeFirst ? teamOrder[teamOrder.length - 1 - i] : teamOrder[i];

      // "Bay" olan takımları eşleşmeye dahil etme
      if (homeTeam._id && awayTeam._id) {
        matches.push({
          homeTeam: homeTeam._id,
          awayTeam: awayTeam._id,
          week: week,
          matchDate: getRandomDateTime(week, 3), // Aynı haftanın 2-3 gününe yay
        });
      }
    }

    // Takımları döndür (round-robin rotation)
    teamOrder.splice(1, 0, teamOrder.pop());
    isHomeFirst = !isHomeFirst; // Ev sahibi ve deplasman sırasını değiştir
    week++;
  }

  // İkinci yarı fikstürünü oluştur (ilk yarının tam tersi)
  const secondHalfMatches = matches.map(match => ({
    homeTeam: match.awayTeam,
    awayTeam: match.homeTeam,
    week: match.week + totalRounds, // Haftayı toplam tur sayısına göre artır
    matchDate: getRandomDateTime(match.week + totalRounds, 3), // Aynı haftanın 2-3 gününe yay
  }));

  // İlk yarı ve ikinci yarıyı birleştir
  matches.push(...secondHalfMatches);

  // Fikstürü kaydet
  const fixture = new Fixture({
    season: seasonId,
    matches,
  });

  await fixture.save();

  // Fikstürü takımların isimleriyle doldur
  const populatedFixture = await Fixture.findById(fixture._id)
    .populate('matches.homeTeam', 'name')
    .populate('matches.awayTeam', 'name');

  console.log('Fixture created successfully.');
  return populatedFixture; // Takım isimlerini içeren fikstürü döndür
};

module.exports = createFixture;