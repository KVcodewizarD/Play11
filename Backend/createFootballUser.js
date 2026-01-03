const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');

// Connect to MongoDB
require('dotenv').config();

async function createFootballUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if football user already exists
    const existingUser = await User.findOne({ email: 'football@gmail.com' });
    
    if (existingUser) {
      console.log('Football user already exists:', existingUser.username);
      process.exit(0);
    }

    // Create football user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('football123', salt);

    const footballUser = new User({
      username: 'Football',
      email: 'football@gmail.com',
      password: hashedPassword,
      balance: 1000,
      rankPoints: 0,
      globalRank: 1,
      contestsPlayed: 0,
      contestsWon: 0,
      totalWinnings: 0,
      winRate: 0
    });

    await footballUser.save();
    console.log('Football user created successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating football user:', error);
    process.exit(1);
  }
}

createFootballUser();