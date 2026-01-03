const express = require('express');
const router = express.Router();
const Contest = require('../models/contest');
const auth = require('../middleware/auth');

// POST a new contest for a match
router.post('/', auth, async (req, res) => {
  try {
    const { 
      name, 
      entryFee, 
      maxParticipants, 
      matchId, 
      maxTeamsPerUser, 
      isPrivate, 
      privateCode, 
      prizeDistribution 
    } = req.body;

    // Validate matchId - check if it's a valid ObjectId or if match exists
    let validMatchId = null;
    
    // If matchId is provided and looks like a valid ObjectId
    if (matchId && matchId.match(/^[0-9a-fA-F]{24}$/)) {
      const Match = require('../models/match');
      const matchExists = await Match.findById(matchId);
      if (matchExists) {
        validMatchId = matchId;
      }
    }
    
    // If no valid match found, create a dummy match or use a default
    if (!validMatchId) {
      const Match = require('../models/match');
      
      // Try to find an existing match or create a default one
      let defaultMatch = await Match.findOne();
      
      if (!defaultMatch) {
        // Create a default match if none exist
        defaultMatch = new Match({
          apiMatchId: `default_${Date.now()}`,
          teams: [
            { name: 'Team A' },
            { name: 'Team B' }
          ],
          matchStartTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          status: 'UPCOMING'
        });
        await defaultMatch.save();
      }
      
      validMatchId = defaultMatch._id;
    }
    
    // Calculate prize breakup based on distribution
    const prizePool = (entryFee || 0) * (maxParticipants || 0) * 0.9; // 10% platform fee
    let prizeBreakup = [];
    
    if (prizeDistribution === 'winner-takes-all') {
      prizeBreakup = [{ rank: '1', prize: prizePool, winnerCount: 1 }];
    } else if (prizeDistribution === '50-30-20') {
      prizeBreakup = [
        { rank: '1', prize: prizePool * 0.5, winnerCount: 1 },
        { rank: '2', prize: prizePool * 0.3, winnerCount: 1 },
        { rank: '3', prize: prizePool * 0.2, winnerCount: 1 }
      ];
    } else {
      // Default distribution
      prizeBreakup = [
        { rank: '1', prize: prizePool * 0.6, winnerCount: 1 },
        { rank: '2-3', prize: prizePool * 0.2, winnerCount: 2 },
        { rank: '4-10', prize: prizePool * 0.02, winnerCount: 7 }
      ];
    }
    
    const newContest = new Contest({
      name,
      entryFee: entryFee || 100,
      maxParticipants: maxParticipants || 100,
      maxTeamsPerUser: maxTeamsPerUser || 1,
      match: validMatchId,
      createdBy: req.user.id,
      isPrivate: isPrivate || false,
      privateCode: isPrivate ? privateCode : undefined,
      prizeBreakup,
      startTime: new Date(),
      status: 'open'
    });
    
    await newContest.save();
    
    // Populate the match data before sending response
    await newContest.populate('match', 'teams matchStartTime status');
    
    res.status(201).json(newContest);
  } catch (error) {
    console.error('Contest creation error:', error);
    res.status(400).json({ message: 'Error creating contest', error: error.message });
  }
});

// GET all contests for a specific match
router.get('/match/:matchId', async (req, res) => {
  try {
    const contests = await Contest.find({ match: req.params.matchId })
      .populate('createdBy', 'username email')
      .populate('match', 'teams matchStartTime status')
      .sort({ createdAt: -1 });
    res.json(contests);
  } catch (error) {
    console.error('Error fetching contests:', error);
    res.status(500).json({ message: 'Error fetching contests' });
  }
});

// GET all contests created by user
router.get('/my-created', auth, async (req, res) => {
  try {
    const contests = await Contest.find({ createdBy: req.user.id })
      .populate('createdBy', 'username email')
      .populate('match', 'teams matchStartTime status')
      .sort({ createdAt: -1 });
    res.json(contests);
  } catch (error) {
    console.error('Error fetching user contests:', error);
    res.status(500).json({ message: 'Error fetching user contests' });
  }
});

// GET all contests user participated in
router.get('/my-participated', auth, async (req, res) => {
  try {
    const contests = await Contest.find({ participants: req.user.id })
      .populate('createdBy', 'username email')
      .populate('match', 'teams matchStartTime status')
      .sort({ createdAt: -1 });
    res.json(contests);
  } catch (error) {
    console.error('Error fetching participated contests:', error);
    res.status(500).json({ message: 'Error fetching participated contests' });
  }
});

// GET all contests (for admin or general listing)
router.get('/', async (req, res) => {
  try {
    const { status, isPrivate, limit = 50 } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (isPrivate !== undefined) filter.isPrivate = isPrivate === 'true';
    
    const contests = await Contest.find(filter)
      .populate('createdBy', 'username email')
      .populate('match', 'teams matchStartTime status')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(contests);
  } catch (error) {
    console.error('Error fetching contests:', error);
    res.status(500).json({ message: 'Error fetching contests' });
  }
});

// GET single contest by ID
router.get('/:contestId', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.contestId)
      .populate('createdBy', 'username email')
      .populate('match', 'teams matchStartTime status')
      .populate('participants', 'username email');
    
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    
    res.json(contest);
  } catch (error) {
    console.error('Error fetching contest:', error);
    res.status(500).json({ message: 'Error fetching contest' });
  }
});

// JOIN a contest
router.post('/:contestId/join', auth, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.contestId);
    
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    
    if (contest.participants.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already joined this contest' });
    }
    
    if (contest.participants.length >= contest.maxParticipants) {
      return res.status(400).json({ message: 'Contest is full' });
    }
    
    contest.participants.push(req.user.id);
    await contest.save();
    
    res.json({ message: 'Successfully joined contest', contest });
  } catch (error) {
    console.error('Error joining contest:', error);
    res.status(500).json({ message: 'Error joining contest' });
  }
});

module.exports = router;