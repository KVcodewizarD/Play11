const express = require('express');
const router = express.Router();
const Match = require('../models/match');

// GET all matches with filtering and sorting
router.get('/', async (req, res) => {
  try {
    const { status, league, limit = 50, sortBy = 'matchStartTime', sortOrder = 'asc' } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) {
      if (Array.isArray(status)) {
        filter.status = { $in: status.map(s => s.toUpperCase()) };
      } else {
        filter.status = status.toUpperCase();
      }
    }
    if (league && league !== 'all') {
      filter.league = new RegExp(league, 'i'); // Case insensitive search
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const matches = await Match.find(filter)
      .sort(sort)
      .limit(parseInt(limit));
    
    // Add contest counts and include score data
    const matchesWithCounts = matches.map(match => {
      const matchObj = match.toObject();
      return {
        ...matchObj,
        totalContests: Math.floor(Math.random() * 50) + 5,
        totalPrizePool: Math.floor(Math.random() * 100000) + 10000,
        lineupAnnounced: Math.random() > 0.5,
        // Include score for LIVE and COMPLETED matches
        score: (match.status === 'LIVE' || match.status === 'COMPLETED') ? 
          (match.score || { home: 0, away: 0 }) : undefined
      };
    });
    
    res.json(matchesWithCounts);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Error fetching matches', error: error.message });
  }
});

// GET matches by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const matches = await Match.find({ status: status.toUpperCase() })
      .sort({ matchStartTime: 1 });
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches by status:', error);
    res.status(500).json({ message: 'Error fetching matches by status' });
  }
});

// GET matches by league
router.get('/league/:league', async (req, res) => {
  try {
    const { league } = req.params;
    const matches = await Match.find({ league: new RegExp(league, 'i') })
      .sort({ matchStartTime: 1 });
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches by league:', error);
    res.status(500).json({ message: 'Error fetching matches by league' });
  }
});

// GET a single match by its ID
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    
    // Add contest data and score
    const matchWithData = {
      ...match.toObject(),
      totalContests: Math.floor(Math.random() * 50) + 5,
      totalPrizePool: Math.floor(Math.random() * 100000) + 10000,
      lineupAnnounced: Math.random() > 0.5,
      // Include score for LIVE and COMPLETED matches
      score: (match.status === 'LIVE' || match.status === 'COMPLETED') ? 
        (match.score || { home: 0, away: 0 }) : undefined
    };
    
    res.json(matchWithData);
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ message: 'Error fetching match' });
  }
});

// GET match statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Match.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const leagueStats = await Match.aggregate([
      {
        $group: {
          _id: '$league',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      statusStats: stats,
      leagueStats: leagueStats,
      totalMatches: await Match.countDocuments()
    });
  } catch (error) {
    console.error('Error fetching match stats:', error);
    res.status(500).json({ message: 'Error fetching match statistics' });
  }
});

module.exports = router;