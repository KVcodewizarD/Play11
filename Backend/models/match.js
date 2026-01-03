const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  apiMatchId: { type: String, required: true, unique: true },
  teams: [{ 
    name: String, 
    league: String 
  }],
  matchStartTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'], 
    default: 'UPCOMING' 
  },
  league: { type: String, default: 'Football' },
  venue: { type: String },
  weather: { type: String },
  score: {
    home: { type: Number, default: 0 },
    away: { type: Number, default: 0 }
  },
  totalContests: { type: Number, default: 0 },
  totalPrizePool: { type: Number, default: 0 },
  lineupAnnounced: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);