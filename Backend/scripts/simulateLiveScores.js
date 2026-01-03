require('dotenv').config();
const mongoose = require('mongoose');
const LiveScore = require('../models/livescore');
const Match = require('../models/match');

// Simulate live score updates
const simulateLiveScoreUpdates = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log('🔄 Starting live score simulation...');
    console.log('📡 Updates will be sent every 5 seconds');
    console.log('Press Ctrl+C to stop\n');

    // Get all live matches
    const liveMatches = await Match.find({ status: 'LIVE' });
    
    if (liveMatches.length === 0) {
      console.log('⚠️ No live matches found. Please ensure there are LIVE matches in the database.');
      console.log('Tip: Run seedMatches.js and make sure at least one match has status: LIVE');
      process.exit(0);
    }

    console.log(`Found ${liveMatches.length} live matches\n`);

    // Update scores every 5 seconds
    setInterval(async () => {
      for (const match of liveMatches) {
        try {
          const liveScore = await LiveScore.findOne({ matchId: match._id });
          
          if (!liveScore) {
            console.log(`⚠️ No live score found for ${match.teams[0].name} vs ${match.teams[1].name}`);
            continue;
          }

          // Increment minute
          liveScore.currentMinute = Math.min(liveScore.currentMinute + 1, 90);

          // Update status based on minute
          if (liveScore.currentMinute <= 45) {
            liveScore.status = 'FIRST_HALF';
          } else if (liveScore.currentMinute === 45) {
            liveScore.status = 'HALF_TIME';
          } else if (liveScore.currentMinute <= 90) {
            liveScore.status = 'SECOND_HALF';
          } else {
            liveScore.status = 'FULL_TIME';
            // Update match status
            match.status = 'COMPLETED';
            await match.save();
          }

          // Random chance of events (20% chance)
          if (Math.random() < 0.2) {
            const eventTypes = ['GOAL', 'YELLOW_CARD', 'CORNER', 'SHOT'];
            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            const team = Math.random() > 0.5 ? 'home' : 'away';

            if (eventType === 'GOAL') {
              if (team === 'home') {
                liveScore.homeScore++;
              } else {
                liveScore.awayScore++;
              }
              
              liveScore.events.push({
                minute: liveScore.currentMinute,
                type: 'GOAL',
                team: team,
                player: `Player ${Math.floor(Math.random() * 11) + 1}`,
                description: 'Goal scored!',
                timestamp: new Date()
              });

              console.log(`⚽ GOAL! ${match.teams[0].name} ${liveScore.homeScore} - ${liveScore.awayScore} ${match.teams[1].name} (${liveScore.currentMinute}')`);
            } else if (eventType === 'YELLOW_CARD') {
              liveScore.stats.yellowCards[team]++;
              liveScore.events.push({
                minute: liveScore.currentMinute,
                type: 'YELLOW_CARD',
                team: team,
                player: `Player ${Math.floor(Math.random() * 11) + 1}`,
                description: 'Yellow card',
                timestamp: new Date()
              });
              console.log(`🟨 Yellow Card - ${match.teams[team === 'home' ? 0 : 1].name} (${liveScore.currentMinute}')`);
            }
          }

          // Update stats slightly
          const homeChange = Math.floor(Math.random() * 3) - 1;
          liveScore.stats.possession.home = Math.max(30, Math.min(70, liveScore.stats.possession.home + homeChange));
          liveScore.stats.possession.away = 100 - liveScore.stats.possession.home;

          if (Math.random() < 0.1) {
            const team = Math.random() > 0.5 ? 'home' : 'away';
            liveScore.stats.shots[team]++;
            if (Math.random() < 0.5) {
              liveScore.stats.shotsOnTarget[team]++;
            }
          }

          await liveScore.save();
          
          console.log(`📊 ${match.teams[0].name} ${liveScore.homeScore} - ${liveScore.awayScore} ${match.teams[1].name} | ${liveScore.currentMinute}' | ${liveScore.status}`);
          
          // Broadcast update via WebSocket to all connected clients
          try {
            // Import the broadcast function from server
            const serverModule = require('../server');
            if (serverModule.io) {
              const updateData = {
                matchId: match._id,
                homeTeam: match.teams[0].name,
                awayTeam: match.teams[1].name,
                homeScore: liveScore.homeScore,
                awayScore: liveScore.awayScore,
                currentMinute: liveScore.currentMinute,
                status: liveScore.status,
                events: liveScore.events.slice(-5),
                stats: liveScore.stats,
                lastUpdated: liveScore.lastUpdated,
                league: match.league
              };
              
              // Broadcast to match room
              serverModule.io.to(`match_${match._id}`).emit('live_score_update', updateData);
              console.log(`📡 Broadcasted to match room: match_${match._id}`);
            }
          } catch (broadcastError) {
            // Silent fail if server module not available (in case simulation runs standalone)
            console.log('⚠️ WebSocket broadcast not available (server may not be running)');
          }
          
        } catch (error) {
          console.error(`Error updating match ${match._id}:`, error.message);
        }
      }
      
      console.log('---');
    }, 5000); // Update every 5 seconds

  } catch (error) {
    console.error('❌ Error in simulation:', error);
    process.exit(1);
  }
};

simulateLiveScoreUpdates();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Stopping simulation...');
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});
