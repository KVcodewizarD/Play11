const express = require('express');
const router = express.Router();
const Player = require('../models/player');

// GET all players with ranking-based filtering
router.get('/', async (req, res) => {
  try {
    const { userRankPoints = 0, position } = req.query;
    
    // Calculate accessible player ranking based on user's rank points
    // Higher rank points = access to better players (lower ranking numbers)
    const maxPlayerRanking = Math.max(100, 1000 - Math.floor(userRankPoints / 10));
    
    let query = {
      globalRanking: { $lte: maxPlayerRanking }
    };
    
    if (position) {
      query.position = position;
    }
    
    const players = await Player.find(query).sort({ globalRanking: 1 });
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching players', error });
  }
});

// GET players for a specific position with rank filtering
router.get('/position/:position', async (req, res) => {
  try {
    const { position } = req.params;
    const { userRankPoints = 0 } = req.query;
    
    const maxPlayerRanking = Math.max(100, 1000 - Math.floor(userRankPoints / 10));
    
    const players = await Player.find({
      position: position.toUpperCase(),
      globalRanking: { $lte: maxPlayerRanking }
    }).sort({ globalRanking: 1 });
    
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching players by position', error });
  }
});

// GET single player by ID
router.get('/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching player', error });
  }
});

module.exports = router;