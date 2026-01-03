const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { 
    type: String, 
    enum: ['GK', 'DEF', 'MID', 'FWD'], 
    required: true 
  },
  team: { type: String, required: true },
  country: { type: String, required: true },
  globalRanking: { type: Number, required: true }, // 1-1000 (1 being the best)
  credits: { type: Number, required: true }, // 1-10 based on ranking
  points: { type: Number, default: 0 }, // Fantasy points
  isPlaying: { type: Boolean, default: true },
  recentForm: [{ type: Number }], // Array of recent match ratings
  avatar: { type: String },
  stats: {
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    cleanSheets: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    yellowCards: { type: Number, default: 0 },
    redCards: { type: Number, default: 0 },
    matchesPlayed: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Player', playerSchema);