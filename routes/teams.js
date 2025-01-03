const express = require('express');
const mongoose = require('mongoose');
const Team = require('../models/Team');
const router = express.Router();
const updateFirstEleven = require('../utils/updateFirstEleven');
const calculateTeamStrengths = require('../utils/calculateTeamStrengths');


// Tüm takımların güçlerini dönen endpoint
router.get('/powers', async (req, res) => {
  try {
    const teams = await Team.find({}, 'name attackStrength defenseStrength');
    res.json(teams);
  } catch (error) {
    console.error('Error fetching team strength:', error.message);
    res.status(500).json({ error: 'Failed to fetch team strength' });
  }
});

router.get('/alldata', async (req, res) => {
  try {
    const teams = await Team.find().populate('players', 'name');

    if (!teams.length) {
      return res.status(404).json({ error: 'No teams found.' });
    }

    const response = teams.map(team => ({
      teamId: team._id,
      name: team.name,
      attackStrength: team.attackStrength,
      defenseStrength: team.defenseStrength,
      players: team.players.map(player => ({
        playerId: player._id,
        name: player.name,
      })),
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching teams:', error.message);
    res.status(500).json({ error: 'Failed to fetch teams.' });
  }
});

router.get('/teams', async (req, res) => {
  try {
    const teams = await Team.find({}, '_id name').lean(); // Sadece _id ve name alanlarını alıyoruz

    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error.message);
    res.status(500).json({ error: 'Failed to fetch teams.' });
  }
});

//ilk 11'i güncelleyen endpoint // use updateFirstEleven function
router.get('/update-first-eleven', async (req, res) => {
  try {
    await updateFirstEleven(req, res);
  } catch (error) {
    console.error('Error in /update-first-eleven:', error.message);
    res.status(500).json({ error: 'Failed to update first eleven players.' });
  }
});


/*** API to calculate and update team strengths. Returns the updated team strengths as JSON response. */
router.get('/update-team-strength', async (req, res) => {
  try {
    const teamStrengths = await calculateTeamStrengths();

    if (!teamStrengths.length) {
      return res.status(404).json({ message: 'No team strengths calculated. Ensure teams and players exist.' });
    }

    res.json({
      message: 'Team strengths updated successfully.',
      data: teamStrengths,
    });
  } catch (error) {
    console.error('Error updating team strengths:', error.message);
    res.status(500).json({ error: 'Failed to update team strengths.' });
  }
});


/**
 * Updates the default tactic for a team.
 * @route POST /update-tactic/:teamId
 * @param {String} teamId - The ID of the team to update.
 * @param {Object} req.body - The request body containing the new tactic.
 * @returns {Object} - Updated team object or error message.
 */
router.post('/update-tactic/:teamId', async (req, res) => {
  const { teamId } = req.params;
  const { defaultTactic } = req.body;

  if (!teamId || !defaultTactic) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return res.status(400).json({ error: 'Invalid team ID.' });
  }

  try {
    const team = await Team.findByIdAndUpdate(teamId, { defaultTactic }, { new: true });

    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    res.json(team);
  } catch (error) {
    console.error('Error updating team tactic:', error.message);
    res.status(500).json({ error: 'Failed to update team tactic.' });
  }
}
);



module.exports = router;