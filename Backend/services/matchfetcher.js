// services/matchFetcher.js
const cron = require('node-cron');
const axios = require('axios');
const Match = require('../models/match');

// Cron job to fetch upcoming matches every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Fetching upcoming matches...');
  const response = await axios.get('https://www.thesportsdb.com/api/v1/json/{YOUR_API_KEY}/eventsnextleague.php?id=4328'); // Example: English Premier League
  
  // Logic to parse response and update your MongoDB
  // Use findOneAndUpdate with upsert:true to avoid duplicate matches
});

// Cron job to update live scores every minute
cron.schedule('* * * * *', async () => {
  const liveMatches = await Match.find({ status: 'LIVE' });
  
  for (const match of liveMatches) {
    // Fetch live score update from API using match.apiMatchId
    // Update the score and status in your database
  }
});