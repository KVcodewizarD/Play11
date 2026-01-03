const express = require('express');
const router = express.Router();
const Team = require('../models/team');
const User = require('../models/user');
const authMiddleware = require('../middleware/auth');

// @route   GET api/teams
// @desc    Get user's teams
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    
    let query = { userId: req.user.id };
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const teams = await Team.find(query)
      .populate('players.playerId', 'name position team credits points')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    res.json(teams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/teams/:id
// @desc    Get specific team by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const team = await Team.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    }).populate('players.playerId', 'name position team credits points avatar stats');

    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    res.json(team);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Team not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/teams
// @desc    Create a new team
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      contestId,
      matchId,
      matchName,
      matchDate,
      players,
      captain,
      viceCaptain,
      totalCreditsUsed
    } = req.body;

    // Validate required fields
    if (!name || !contestId || !matchId || !players || !captain || !viceCaptain) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    // Validate team composition
    if (players.length !== 11) {
      return res.status(400).json({ msg: 'Team must have exactly 11 players' });
    }

    // Validate captain and vice captain are in the team
    const captainInTeam = players.find(p => p.playerId === captain.playerId);
    const viceCaptainInTeam = players.find(p => p.playerId === viceCaptain.playerId);
    
    if (!captainInTeam || !viceCaptainInTeam) {
      return res.status(400).json({ msg: 'Captain and Vice Captain must be in the team' });
    }

    // Check if user already has a team for this contest
    const existingTeam = await Team.findOne({
      userId: req.user.id,
      contestId: contestId
    });

    if (existingTeam) {
      return res.status(400).json({ msg: 'You already have a team for this contest' });
    }

    // Set multipliers for captain and vice captain
    const teamPlayers = players.map(player => {
      let multiplier = 1;
      if (player.playerId === captain.playerId) {
        multiplier = 2;
      } else if (player.playerId === viceCaptain.playerId) {
        multiplier = 1.5;
      }
      return { ...player, multiplier };
    });

    const newTeam = new Team({
      name,
      userId: req.user.id,
      contestId,
      matchId,
      matchName,
      matchDate: new Date(matchDate),
      players: teamPlayers,
      captain,
      viceCaptain,
      totalCreditsUsed,
      totalPoints: 0,
      status: 'upcoming'
    });

    await newTeam.save();

    // Update user's contest participation
    const user = await User.findById(req.user.id);
    if (user) {
      user.contestsPlayed += 1;
      user.rankPoints += 5; // Award 5 rank points for participating
      user.balance += 10; // Award 10 credits for participating
      
      // Recalculate global rank
      const usersWithBetterRank = await User.countDocuments({ 
        rankPoints: { $gt: user.rankPoints } 
      });
      user.globalRank = usersWithBetterRank + 1;
      
      await user.save();
    }

    res.status(201).json({
      team: newTeam,
      message: 'Team created successfully! +5 rank points and +10 credits awarded!'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/teams/:id
// @desc    Update team (only if status is upcoming)
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const team = await Team.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    if (team.status !== 'upcoming') {
      return res.status(400).json({ msg: 'Cannot update team after contest has started' });
    }

    const {
      name,
      players,
      captain,
      viceCaptain,
      totalCreditsUsed
    } = req.body;

    // Update team fields
    if (name) team.name = name;
    if (players) {
      // Validate team composition
      if (players.length !== 11) {
        return res.status(400).json({ msg: 'Team must have exactly 11 players' });
      }
      
      // Set multipliers for captain and vice captain
      const teamPlayers = players.map(player => {
        let multiplier = 1;
        if (player.playerId === captain.playerId) {
          multiplier = 2;
        } else if (player.playerId === viceCaptain.playerId) {
          multiplier = 1.5;
        }
        return { ...player, multiplier };
      });
      
      team.players = teamPlayers;
    }
    if (captain) team.captain = captain;
    if (viceCaptain) team.viceCaptain = viceCaptain;
    if (totalCreditsUsed) team.totalCreditsUsed = totalCreditsUsed;

    await team.save();

    res.json(team);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Team not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/teams/:id
// @desc    Delete team (only if status is upcoming)
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const team = await Team.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    if (team.status !== 'upcoming') {
      return res.status(400).json({ msg: 'Cannot delete team after contest has started' });
    }

    await Team.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Team deleted successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Team not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/teams/stats/summary
// @desc    Get user's team statistics
// @access  Private
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const totalTeams = await Team.countDocuments({ userId: req.user.id });
    const liveTeams = await Team.countDocuments({ userId: req.user.id, status: 'live' });
    const completedTeams = await Team.countDocuments({ userId: req.user.id, status: 'completed' });
    
    const topFinishes = await Team.countDocuments({ 
      userId: req.user.id, 
      rank: { $lte: 3, $ne: null } 
    });

    const avgPointsResult = await Team.aggregate([
      { $match: { userId: req.user.id, status: 'completed' } },
      { $group: { _id: null, avgPoints: { $avg: '$totalPoints' } } }
    ]);

    const avgPoints = avgPointsResult.length > 0 ? Math.round(avgPointsResult[0].avgPoints) : 0;

    res.json({
      totalTeams,
      liveTeams,
      completedTeams,
      topFinishes,
      avgPoints
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;