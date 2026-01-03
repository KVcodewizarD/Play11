const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  entryFee: { type: Number, default: 100 },
  maxParticipants: { type: Number, default: 1000, required: true },
  maxTeamsPerUser: { type: Number, default: 1 },
  // This creates the link to a specific match
  match: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Match', 
    required: true 
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  isPrivate: { type: Boolean, default: false },
  privateCode: { type: String },
  status: { 
    type: String, 
    enum: ['open', 'closed', 'live', 'completed', 'cancelled'], 
    default: 'open' 
  },
  prizeBreakup: [{
    rank: String,
    prize: Number,
    winnerCount: Number
  }],
  startTime: { type: Date },
  endTime: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);