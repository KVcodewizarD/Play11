require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Play11Model = require('./models/play11');
const play11 = require('./models/play11');
const LiveScore = require('./models/livescore');
const matchRoutes = require('./routes/matches.js');
const contestRoutes = require('./routes/contests.js');
const teamRoutes = require('./routes/teams.js');
const userRoutes = require('./routes/users.js');
const playerRoutes = require('./routes/players.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/matches', matchRoutes);
app.use('/api/contests', contestRoutes);

// <-- 1. ADD THIS MIDDLEWARE TO PARSE JSON -->
// app.use(express.json());

const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas!');
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log('🔌 WebSocket server is ready');
    });
  })
  .catch(err => {
    console.error('❌ Connection error:', err.message);
  });

// --- API ROUTES ---

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to the Play_11 API!');
});

// Define User routes
app.use('/api/users', require('./routes/users'));
// Define other routes
app.use('/api/matches', require('./routes/matches'));
app.use('/api/contests', require('./routes/contests'));
app.use('/api/players', require('./routes/players'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/livescores', require('./routes/livescores'));

// GET route to fetch all data
app.get('/api/data', async (req, res) => {
  try {
    const data = await play11.find({});
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error: error });
  }
});

// <-- 2. ADD THIS NEW POST ROUTE TO CREATE DATA -->
app.post('/api/data', async (req, res) => {
  try {
    // Create a new document instance from the request body
    const newData = new Play11Model({
      name: req.body.name,
      email: req.body.email
    });
    
    // Save the new document to the database
    const savedData = await newData.save();
    
    // Send the newly created document back with a 201 status code
    res.status(201).json(savedData);
  } catch (error) {
    res.status(400).json({ message: 'Error creating data', error: error });
  }
});

// =====================================================
// WEBSOCKET IMPLEMENTATION FOR LIVE SCORES
// =====================================================

// Store connected clients by room
const connectedClients = new Map();

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);
  
  // Send initial connection confirmation
  socket.emit('connected', { 
    message: 'Connected to Live Scores WebSocket',
    socketId: socket.id 
  });

  // Join a specific match room to receive live score updates
  socket.on('join_match', async (data) => {
    const { matchId } = data;
    
    if (!matchId) {
      socket.emit('error', { message: 'Match ID is required' });
      return;
    }

    try {
      // Join the socket room for this match
      socket.join(`match_${matchId}`);
      console.log(`📍 Client ${socket.id} joined match room: ${matchId}`);
      
      // Fetch current live score for this match
      const liveScore = await LiveScore.findOne({ matchId }).populate('matchId', 'teams matchStartTime status');
      
      if (liveScore) {
        // Send current score immediately
        socket.emit('live_score_update', {
          matchId: liveScore.matchId._id,
          homeTeam: liveScore.matchId.teams[0].name,
          awayTeam: liveScore.matchId.teams[1].name,
          homeScore: liveScore.homeScore,
          awayScore: liveScore.awayScore,
          currentMinute: liveScore.currentMinute,
          status: liveScore.status,
          events: liveScore.events,
          stats: liveScore.stats,
          lastUpdated: liveScore.lastUpdated
        });
      } else {
        socket.emit('live_score_update', {
          matchId,
          message: 'No live score data available yet'
        });
      }
    } catch (error) {
      console.error('Error joining match room:', error);
      socket.emit('error', { message: 'Failed to join match room' });
    }
  });

  // Leave a match room
  socket.on('leave_match', (data) => {
    const { matchId } = data;
    socket.leave(`match_${matchId}`);
    console.log(`📤 Client ${socket.id} left match room: ${matchId}`);
  });

  // Join all live matches
  socket.on('join_all_live', async () => {
    try {
      const Match = require('./models/match');
      const liveMatches = await Match.find({ status: 'LIVE' });
      
      liveMatches.forEach(match => {
        socket.join(`match_${match._id}`);
      });
      
      console.log(`📍 Client ${socket.id} joined ${liveMatches.length} live match rooms`);
      
      // Fetch all live scores
      const liveScores = await LiveScore.find({ 
        matchId: { $in: liveMatches.map(m => m._id) } 
      }).populate('matchId', 'teams matchStartTime status');
      
      // Send all live scores
      socket.emit('all_live_scores', liveScores.map(ls => ({
        matchId: ls.matchId._id,
        homeTeam: ls.matchId.teams[0].name,
        awayTeam: ls.matchId.teams[1].name,
        homeScore: ls.homeScore,
        awayScore: ls.awayScore,
        currentMinute: ls.currentMinute,
        status: ls.status,
        events: ls.events.slice(-5), // Last 5 events
        stats: ls.stats,
        lastUpdated: ls.lastUpdated
      })));
    } catch (error) {
      console.error('Error joining all live matches:', error);
      socket.emit('error', { message: 'Failed to join live matches' });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Function to broadcast live score updates (called when score changes in database)
async function broadcastLiveScoreUpdate(matchId) {
  try {
    const liveScore = await LiveScore.findOne({ matchId }).populate('matchId', 'teams matchStartTime status');
    
    if (liveScore) {
      const updateData = {
        matchId: liveScore.matchId._id,
        homeTeam: liveScore.matchId.teams[0].name,
        awayTeam: liveScore.matchId.teams[1].name,
        homeScore: liveScore.homeScore,
        awayScore: liveScore.awayScore,
        currentMinute: liveScore.currentMinute,
        status: liveScore.status,
        events: liveScore.events,
        stats: liveScore.stats,
        lastUpdated: liveScore.lastUpdated
      };
      
      // Broadcast to all clients in this match room
      io.to(`match_${matchId}`).emit('live_score_update', updateData);
      console.log(`📡 Broadcasted live score update for match ${matchId}`);
    }
  } catch (error) {
    console.error('Error broadcasting live score:', error);
  }
}

// Export io and broadcast function for use in other files
module.exports = { app, server, io, broadcastLiveScoreUpdate };
