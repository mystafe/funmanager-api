const Goal = require('../models/Goal');

const getMostGoalsMinute = async () => {
  try {
    // Tüm golleri getir
    const goals = await Goal.find({}, 'minute');

    if (!goals.length) {
      console.log('No goals found in the database.');
      return null;
    }

    // Dakikalara göre gol sayısını say
    const minuteCount = goals.reduce((acc, goal) => {
      const minute = goal.minute;
      acc[minute] = (acc[minute] || 0) + 1;
      return acc;
    }, {});

    // En çok gol atılan dakikayı bul
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
    // Tüm golleri getir
    const goals = await Goal.find({}, 'minute');

    if (!goals.length) {
      console.log('No goals found in the database.');
      return null;
    }

    // Dakikalara göre gol sayısını say
    const minuteCount = goals.reduce((acc, goal) => {
      const minute = goal.minute;
      acc[minute] = (acc[minute] || 0) + 1;
      return acc;
    }, {});

    // Dakikalara göre sıralama yap ve ilk 3'ü al
    const topThreeMinutes = Object.entries(minuteCount)
      .sort((a, b) => b[1] - a[1]) // Gol sayısına göre azalan sırada sıralar
      .slice(0, 3) // İlk 3'ü alır
      .map(([minute, count]) => ({ minute: parseInt(minute), count })); // Formatlar

    return topThreeMinutes;
  } catch (error) {
    console.error('Error calculating top three goal minutes:', error.message);
    throw new Error('Failed to calculate top three goal minutes.');
  }
};

module.exports = { getMostGoalsMinute, getTopThreeGoalMinutes };