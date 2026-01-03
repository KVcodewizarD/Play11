require('dotenv').config();
const mongoose = require('mongoose');
const LiveScore = require('../models/livescore');
const Match = require('../models/match');

const seedLiveScores = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing live scores
    await LiveScore.deleteMany({});
    console.log('🗑️ Cleared existing live scores');

    // Get all live and upcoming matches
    const matches = await Match.find({ 
      status: { $in: ['LIVE', 'UPCOMING'] } 
    });

    if (matches.length === 0) {
      console.log('⚠️ No matches found. Please run seedMatches.js first');
      process.exit(0);
    }

    const liveScoresToInsert = [];

    for (const match of matches) {
      const isLive = match.status === 'LIVE';
      
      // Get score from match if exists, or generate random
      const homeScore = isLive ? (match.score?.home ?? Math.floor(Math.random() * 3)) : 0;
      const awayScore = isLive ? (match.score?.away ?? Math.floor(Math.random() * 3)) : 0;
      
      const liveScore = {
        matchId: match._id,
        homeScore: homeScore,
        awayScore: awayScore,
        currentMinute: isLive ? Math.floor(Math.random() * 90) + 1 : 0,
        status: isLive ? (Math.random() > 0.5 ? 'FIRST_HALF' : 'SECOND_HALF') : 'NOT_STARTED',
        events: isLive ? [
          {
            minute: 15,
            type: 'GOAL',
            team: 'home',
            player: match.teams[0].name.split(' ').pop() + ' Player',
            description: 'Great strike from outside the box',
            timestamp: new Date()
          },
          {
            minute: 23,
            type: 'YELLOW_CARD',
            team: 'away',
            player: match.teams[1].name.split(' ').pop() + ' Player',
            description: 'Foul on the edge of the box',
            timestamp: new Date()
          },
          homeScore > 0 || awayScore > 0 ? {
            minute: 34,
            type: 'GOAL',
            team: awayScore > homeScore ? 'away' : 'home',
            player: match.teams[awayScore > homeScore ? 1 : 0].name.split(' ').pop() + ' Player',
            description: 'Header from a corner kick',
            timestamp: new Date()
          } : null
        ].filter(Boolean) : [],
        stats: {
          possession: {
            home: Math.floor(Math.random() * 30) + 40,
            away: Math.floor(Math.random() * 30) + 40
          },
          shots: {
            home: Math.floor(Math.random() * 10) + 5,
            away: Math.floor(Math.random() * 10) + 5
          },
          shotsOnTarget: {
            home: Math.floor(Math.random() * 5) + 2,
            away: Math.floor(Math.random() * 5) + 2
          },
          corners: {
            home: Math.floor(Math.random() * 8),
            away: Math.floor(Math.random() * 8)
          },
          fouls: {
            home: Math.floor(Math.random() * 12),
            away: Math.floor(Math.random() * 12)
          },
          yellowCards: {
            home: Math.floor(Math.random() * 3),
            away: Math.floor(Math.random() * 3)
          },
          redCards: {
            home: 0,
            away: 0
          }
        }
      };

      liveScoresToInsert.push(liveScore);
    }

    // Insert live scores
    const insertedScores = await LiveScore.insertMany(liveScoresToInsert);
    console.log(`✅ Inserted ${insertedScores.length} live scores`);

    for (let i = 0; i < insertedScores.length; i++) {
      const score = insertedScores[i];
      const match = matches[i];
      console.log(`📊 Live Score: ${match.teams[0].name} ${score.homeScore} - ${score.awayScore} ${match.teams[1].name} (${score.status})`);
    }

    console.log('🎉 Live score seeding completed!');
    console.log('');
    console.log('💡 To update live scores in real-time, use the API:');
    console.log('   POST /api/livescores/update/:matchId');
    console.log('   Body: { homeScore, awayScore, currentMinute, status, event, stats }');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding live scores:', error);
    process.exit(1);
  }
};

seedLiveScores();
