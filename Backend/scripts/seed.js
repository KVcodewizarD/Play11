require('dotenv').config(); // Load environment variables from .env in Backend folder
const mongoose = require('mongoose');
const Match = require('../models/match'); // We will create this model next

const sampleMatches = [
  {
    apiMatchId: 'SAMPLE001',
    teams: [{ name: 'Manchester United' }, { name: 'Chelsea' }],
    matchStartTime: new Date('2025-10-10T19:00:00Z'),
    status: 'UPCOMING',
  },
  {
    apiMatchId: 'SAMPLE002',
    teams: [{ name: 'Real Madrid' }, { name: 'Barcelona' }],
    matchStartTime: new Date('2025-10-11T20:00:00Z'),
    status: 'UPCOMING',
  },
  {
    apiMatchId: 'SAMPLE003',
    teams: [{ name: 'Bayern Munich' }, { name: 'Borussia Dortmund' }],
    matchStartTime: new Date('2025-10-12T18:30:00Z'),
    status: 'COMPLETED',
    score: { home: 3, away: 2 }
  },
];

const seedDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');
  
  await Match.deleteMany({}); // Clear existing matches
  console.log('Old matches deleted.');
  
  await Match.insertMany(sampleMatches);
  console.log('Sample matches have been added!');
  
  mongoose.connection.close();
};

seedDB().catch(err => {
  console.error(err);
  mongoose.connection.close();
});