// Dakikayı rastgele oluşturmak için yardımcı fonksiyon
const generateMinute = () => {
  const weights = [15, 70, 15]; // İlk 15 dakika, orta 70 dakika, son 15 dakika
  const ranges = [1, 46, 76, 91]; // Aralıklar
  const randomWeight = Math.random() * 100;

  if (randomWeight <= weights[0]) {
    return Math.floor(Math.random() * (ranges[1] - ranges[0])) + ranges[0]; // İlk 15 dakika
  } else if (randomWeight <= weights[0] + weights[1]) {
    return Math.floor(Math.random() * (ranges[2] - ranges[1])) + ranges[1]; // 46-75 dakika
  } else {
    return Math.floor(Math.random() * (ranges[3] - ranges[2])) + ranges[2]; // 76-90 dakika
  }
};

module.exports = generateMinute;