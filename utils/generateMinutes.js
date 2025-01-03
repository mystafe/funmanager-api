/**
 * Generates a sorted array of unique random minutes for goal events.
 *
 * @param {Number} goals - Number of goals to assign minutes for.
 * @returns {Array} - Sorted array of unique goal minutes.
 */
const generateMinutes = (goals) => {
  if (goals === 0) return []; // Gol yoksa boş bir array döndür.

  const weights = [15, 70, 15]; // İlk 15 dakika, orta 70 dakika, son 15 dakika
  const ranges = [1, 46, 76, 91]; // Dakika aralıkları
  const generatedMinutes = new Set();

  while (generatedMinutes.size < goals) {
    const randomWeight = Math.random() * 100;
    let minute;

    if (randomWeight <= weights[0]) {
      minute = Math.floor(Math.random() * (ranges[1] - ranges[0])) + ranges[0]; // İlk 15 dakika
    } else if (randomWeight <= weights[0] + weights[1]) {
      minute = Math.floor(Math.random() * (ranges[2] - ranges[1])) + ranges[1]; // 46-75 dakika
    } else {
      minute = Math.floor(Math.random() * (ranges[3] - ranges[2])) + ranges[2]; // 76-90 dakika
    }

    generatedMinutes.add(minute); // Aynı dakikayı tekrar etmeyi önler.
  }

  return Array.from(generatedMinutes).sort((a, b) => a - b); // Dakikaları sıralar.
};

module.exports = generateMinutes;