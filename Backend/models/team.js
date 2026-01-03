const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contestId: {
    type: String,
    required: true
  },
  matchId: {
    type: String,
    required: true
  },
  matchName: {
    type: String,
    required: true
  },
  matchDate: {
    type: Date,
    required: true
  },
  players: [{
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    position: {
      type: String,
      required: true,
      enum: ['GK', 'DEF', 'MID', 'FWD']
    },
    team: {
      type: String,
      required: true
    },
    credits: {
      type: Number,
      required: true
    },
    points: {
      type: Number,
      default: 0
    },
    multiplier: {
      type: Number,
      default: 1
    }
  }],
  captain: {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    position: {
      type: String,
      required: true
    }
  },
  viceCaptain: {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    position: {
      type: String,
      required: true
    }
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  totalCreditsUsed: {
    type: Number,
    required: true
  },
  rank: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed'],
    default: 'upcoming'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
teamSchema.index({ userId: 1, contestId: 1 });
teamSchema.index({ status: 1 });
teamSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Team', teamSchema);