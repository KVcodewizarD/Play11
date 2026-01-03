const express = require('express');
const router = express.Router();
const LiveScore = require('../models/livescore');
const Match = require('../models/match');

// GET all live scores
router.get('/', async (req, res) => {
  try {
    const liveScores = await LiveScore.find()
      .populate('matchId', 'teams matchStartTime status league')
      .sort({ lastUpdated: -1 })
      .limit(50);
    
    const formattedScores = liveScores.map(ls => ({
      id: ls._id,
      matchId: ls.matchId._id,
      homeTeam: ls.matchId.teams[0].name,
      awayTeam: ls.matchId.teams[1].name,
      homeScore: ls.homeScore,
      awayScore: ls.awayScore,
      currentMinute: ls.currentMinute,
      status: ls.status,
      events: ls.events,
      stats: ls.stats,
      matchStartTime: ls.matchId.matchStartTime,
      league: ls.matchId.league,
      lastUpdated: ls.lastUpdated
    }));
    
    res.json(formattedScores);
  } catch (error) {
    console.error('Error fetching live scores:', error);
    res.status(500).json({ message: 'Error fetching live scores', error: error.message });
  }
});

// GET live scores for active/live matches only
router.get('/active', async (req, res) => {
  try {
    const liveMatches = await Match.find({ 
      status: { $in: ['LIVE', 'UPCOMING'] } 
    });
    
    const matchIds = liveMatches.map(m => m._id);
    
    const liveScores = await LiveScore.find({ matchId: { $in: matchIds } })
      .populate('matchId', 'teams matchStartTime status league')
      .sort({ lastUpdated: -1 });
    
    const formattedScores = liveScores.map(ls => ({
      id: ls._id,
      matchId: ls.matchId._id,
      homeTeam: ls.matchId.teams[0].name,
      awayTeam: ls.matchId.teams[1].name,
      homeScore: ls.homeScore,
      awayScore: ls.awayScore,
      currentMinute: ls.currentMinute,
      status: ls.status,
      events: ls.events.slice(-10), // Last 10 events
      stats: ls.stats,
      matchStartTime: ls.matchId.matchStartTime,
      matchStatus: ls.matchId.status,
      league: ls.matchId.league,
      lastUpdated: ls.lastUpdated
    }));
    
    res.json(formattedScores);
  } catch (error) {
    console.error('Error fetching active live scores:', error);
    res.status(500).json({ message: 'Error fetching active live scores', error: error.message });
  }
});

// GET live score for a specific match
router.get('/match/:matchId', async (req, res) => {
  try {
    const liveScore = await LiveScore.findOne({ matchId: req.params.matchId })
      .populate('matchId', 'teams matchStartTime status league');
    
    if (!liveScore) {
      return res.status(404).json({ message: 'Live score not found for this match' });
    }
    
    const formattedScore = {
      id: liveScore._id,
      matchId: liveScore.matchId._id,
      homeTeam: liveScore.matchId.teams[0].name,
      awayTeam: liveScore.matchId.teams[1].name,
      homeScore: liveScore.homeScore,
      awayScore: liveScore.awayScore,
      currentMinute: liveScore.currentMinute,
      status: liveScore.status,
      events: liveScore.events,
      stats: liveScore.stats,
      matchStartTime: liveScore.matchId.matchStartTime,
      matchStatus: liveScore.matchId.status,
      league: liveScore.matchId.league,
      lastUpdated: liveScore.lastUpdated
    };
    
    res.json(formattedScore);
  } catch (error) {
    console.error('Error fetching live score:', error);
    res.status(500).json({ message: 'Error fetching live score', error: error.message });
  }
});

// POST/UPDATE live score (for admin/system updates)
router.post('/update/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    const { 
      homeScore, 
      awayScore, 
      currentMinute, 
      status, 
      event,
      stats 
    } = req.body;
    
    // Check if match exists
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Find or create live score
    let liveScore = await LiveScore.findOne({ matchId });
    
    if (!liveScore) {
      liveScore = new LiveScore({ matchId });
    }
    
    // Update scores
    if (homeScore !== undefined) liveScore.homeScore = homeScore;
    if (awayScore !== undefined) liveScore.awayScore = awayScore;
    if (currentMinute !== undefined) liveScore.currentMinute = currentMinute;
    if (status) liveScore.status = status;
    if (stats) liveScore.stats = { ...liveScore.stats, ...stats };
    
    // Add event if provided
    if (event) {
      liveScore.events.push({
        minute: event.minute || currentMinute,
        type: event.type,
        team: event.team,
        player: event.player,
        description: event.description,
        timestamp: new Date()
      });
      
      // Update stats based on event type
      if (event.type === 'YELLOW_CARD') {
        liveScore.stats.yellowCards[event.team]++;
      } else if (event.type === 'RED_CARD') {
        liveScore.stats.redCards[event.team]++;
      }
    }
    
    await liveScore.save();
    
    // Broadcast update via WebSocket
    const { broadcastLiveScoreUpdate } = require('../server');
    broadcastLiveScoreUpdate(matchId);
    
    res.json({ 
      message: 'Live score updated successfully',
      liveScore 
    });
  } catch (error) {
    console.error('Error updating live score:', error);
    res.status(500).json({ message: 'Error updating live score', error: error.message });
  }
});

// DELETE live score
router.delete('/:matchId', async (req, res) => {
  try {
    await LiveScore.findOneAndDelete({ matchId: req.params.matchId });
    res.json({ message: 'Live score deleted successfully' });
  } catch (error) {
    console.error('Error deleting live score:', error);
    res.status(500).json({ message: 'Error deleting live score' });
  }
});

module.exports = router;
