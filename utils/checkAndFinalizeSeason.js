const Fixture = require('../models/Fixture');
const Season = require('../models/Season');
const saveAchievement = require('./saveAchievement');

/**
 * Checks if all matches for a season are completed, finalizes the season,
 * and calls saveAchievement to update achievements.
 *
 * @param {Object} season - The active season object.
 */
const checkAndFinalizeSeason = async (season) => {
  try {
    // Sezonun fikstürünü kontrol et
    const fixture = await Fixture.findOne({ season: season._id });

    if (!fixture || !fixture.matches.length) {
      throw new Error(`No matches found for season ${season.seasonNumber}`);
    }

    // Oynanmamış maçları kontrol et
    const unplayedMatches = fixture.matches.filter(
      (match) => match.homeScore === null || match.awayScore === null
    );

    if (unplayedMatches.length > 0) {
      console.log(`Season ${season.seasonNumber} is not yet complete. ${unplayedMatches.length} matches remaining.`);
      return; // Sezon tamamlanmamış
    }

    // Sezonu tamamlanmış olarak işaretle
    season.isCompleted = true;
    await season.save();
    console.log(`Season ${season.seasonNumber} marked as completed.`);

    // Başarıları kaydet
    await saveAchievement(season);
    console.log(`Achievements saved for Season ${season.seasonNumber}`);
  } catch (error) {
    console.error('Error finalizing season:', error.message);
    throw new Error('Failed to finalize season.');
  }
};

module.exports = checkAndFinalizeSeason;