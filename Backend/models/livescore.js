const mongoose = require('mongoose');

const liveScoreSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
    index: true
  },
  homeScore: {
    type: Number,
    default: 0
  },
  awayScore: {
    type: Number,
    default: 0
  },
  currentMinute: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['NOT_STARTED', 'FIRST_HALF', 'HALF_TIME', 'SECOND_HALF', 'FULL_TIME', 'EXTRA_TIME', 'PENALTIES'],
    default: 'NOT_STARTED'
  },
  events: [{
    minute: Number,
    type: {
      type: String,
      enum: ['GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION', 'PENALTY', 'OWN_GOAL']
    },
    team: {
      type: String,
      enum: ['home', 'away']
    },
    player: String,
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  stats: {
    possession: {
      home: { type: Number, default: 50 },
      away: { type: Number, default: 50 }
    },
    shots: {
      home: { type: Number, default: 0 },
      away: { type: Number, default: 0 }
    },
    shotsOnTarget: {
      home: { type: Number, default: 0 },
      away: { type: Number, default: 0 }
    },
    corners: {
      home: { type: Number, default: 0 },
      away: { type: Number, default: 0 }
    },
    fouls: {
      home: { type: Number, default: 0 },
      away: { type: Number, default: 0 }
    },
    yellowCards: {
      home: { type: Number, default: 0 },
      away: { type: Number, default: 0 }
    },
    redCards: {
      home: { type: Number, default: 0 },
      away: { type: Number, default: 0 }
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
liveScoreSchema.index({ matchId: 1, lastUpdated: -1 });

// Update lastUpdated on save
liveScoreSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('LiveScore', liveScoreSchema);
