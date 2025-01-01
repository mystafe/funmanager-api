const Fixture = require('../models/Fixture');
const Season = require('../models/Season');
const saveAchievement = require('./saveAchievement');
const calculateSeasonStats = require('./calculateSeasonStats');

/**
 * Checks if all matches for a season are completed, finalizes the season,
 * calculates season statistics, and calls saveAchievement to update achievements.
 *
 * @param {Object} season - The active season object.
 */
const checkAndFinalizeSeason = async (season) => {
  try {
    console.log(`Checking completion status for Season ${season.seasonNumber}...`);

    // Sezonun fikstürünü kontrol et
    const fixture = await Fixture.findOne({ season: season._id });

    if (!fixture || !fixture.matches?.length) {
      console.warn(`No matches found for Season ${season.seasonNumber}.`);
      return;
    }

    // Oynanmamış maçları kontrol et
    const unplayedMatches = fixture.matches.filter(
      (match) => match.homeScore === null || match.awayScore === null
    );

    if (unplayedMatches.length > 0) {
      console.log(
        `Season ${season.seasonNumber} is not yet complete. ${unplayedMatches.length} matches remaining.`
      );
      return; // Sezon tamamlanmamış
    }

    // Sezonu tamamlanmış olarak işaretle
    season.isCompleted = true;
    await season.save();
    console.log(`Season ${season.seasonNumber} marked as completed.`);

    // Sezon istatistiklerini hesapla
    console.log(`Calculating statistics for Season ${season.seasonNumber}...`);
    await calculateSeasonStats(season);

    // Başarıları kaydet
    console.log(`Saving achievements for Season ${season.seasonNumber}...`);
    await saveAchievement(season);
    console.log(`Achievements saved successfully for Season ${season.seasonNumber}.`);
  } catch (error) {
    console.error(`Error finalizing Season ${season?.seasonNumber || 'Unknown'}:`, error.message);
    throw new Error('Failed to finalize the season.');
  }
};

module.exports = checkAndFinalizeSeason;