const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// This is the blueprint for a "user" paper.
const userSchema = new mongoose.Schema({
  username: {
    type: String,     // Must be a line of text
    required: true,   // You must provide a username
    unique: true      // No two users can have the same username
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {         // In a real app, this should be a hashed password, not plain text!
    type: String,
    required: true
  },
  balance: {
    type: Number,     // Must be a number
    default: 100      // New users get 100 credits
  },
  // New ranking system fields
  rankPoints: {
    type: Number,
    default: 0        // New users start with 0 rank points
  },
  globalRank: {
    type: Number,
    default: null     // Will be calculated based on rank points
  },
  contestsPlayed: {
    type: Number,
    default: 0
  },
  contestsWon: {
    type: Number,
    default: 0
  },
  totalWinnings: {
    type: Number,
    default: 0
  },
  winRate: {
    type: Number,
    default: 0
  },
  badges: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const payload = {
    user: {
      id: this._id
    }
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
};

// Method to compare password
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// This creates the "Users" folder using the blueprint above.
module.exports = mongoose.model('User', userSchema);