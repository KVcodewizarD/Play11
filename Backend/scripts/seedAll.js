require('dotenv').config();
const mongoose = require('mongoose');
const Match = require('../models/match');
const LiveScore = require('../models/livescore');

console.log('🚀 Starting comprehensive database seeding...\n');

const seedAll = async () => {
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas!\n');

    // ==========================================
    // STEP 1: Seed Matches
    // ==========================================
    console.log('📍 STEP 1: Seeding Matches');
    console.log('═══════════════════════════');
    
    await Match.deleteMany({});
    console.log('🗑️  Cleared existing matches');

    const sampleMatches = [
      // Premier League Matches
      {
        apiMatchId: 'match_001',
        teams: [
          { name: 'Manchester United', league: 'Premier League' },
          { name: 'Liverpool', league: 'Premier League' }
        ],
        matchStartTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'UPCOMING',
        league: 'Premier League',
        venue: 'Old Trafford',
        weather: 'Clear, 18°C'
      },
      {
        apiMatchId: 'match_002',
        teams: [
          { name: 'Chelsea', league: 'Premier League' },
          { name: 'Arsenal', league: 'Premier League' }
        ],
        matchStartTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
        status: 'UPCOMING',
        league: 'Premier League',
        venue: 'Stamford Bridge',
        weather: 'Cloudy, 16°C'
      },
      {
        apiMatchId: 'match_003',
        teams: [
          { name: 'Manchester City', league: 'Premier League' },
          { name: 'Tottenham', league: 'Premier League' }
        ],
        matchStartTime: new Date(Date.now() - 30 * 60 * 1000),
        status: 'LIVE',
        league: 'Premier League',
        venue: 'Etihad Stadium',
        weather: 'Rainy, 14°C',
        score: { home: 2, away: 1 }
      },
      {
        apiMatchId: 'match_004',
        teams: [
          { name: 'Newcastle United', league: 'Premier League' },
          { name: 'Brighton', league: 'Premier League' }
        ],
        matchStartTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
        status: 'UPCOMING',
        league: 'Premier League',
        venue: 'St. James Park',
        weather: 'Sunny, 20°C'
      },
      {
        apiMatchId: 'match_005',
        teams: [
          { name: 'Aston Villa', league: 'Premier League' },
          { name: 'West Ham', league: 'Premier League' }
        ],
        matchStartTime: new Date(Date.now() - 90 * 60 * 1000),
        status: 'COMPLETED',
        league: 'Premier League',
        venue: 'Villa Park',
        weather: 'Partly Cloudy, 17°C',
        score: { home: 2, away: 1 }
      },
      // Champions League
      {
        apiMatchId: 'match_006',
        teams: [
          { name: 'Real Madrid', league: 'Champions League' },
          { name: 'Barcelona', league: 'Champions League' }
        ],
        matchStartTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'UPCOMING',
        league: 'Champions League',
        venue: 'Santiago Bernabéu',
        weather: 'Clear, 22°C'
      },
      {
        apiMatchId: 'match_007',
        teams: [
          { name: 'PSG', league: 'Champions League' },
          { name: 'Bayern Munich', league: 'Champions League' }
        ],
        matchStartTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'COMPLETED',
        league: 'Champions League',
        venue: 'Parc des Princes',
        weather: 'Mild, 19°C',
        score: { home: 2, away: 3 }
      },
      {
        apiMatchId: 'match_008',
        teams: [
          { name: 'AC Milan', league: 'Champions League' },
          { name: 'Inter Milan', league: 'Champions League' }
        ],
        matchStartTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'UPCOMING',
        league: 'Champions League',
        venue: 'San Siro',
        weather: 'Cool, 15°C'
      },
      {
        apiMatchId: 'match_009',
        teams: [
          { name: 'Borussia Dortmund', league: 'Champions League' },
          { name: 'Juventus', league: 'Champions League' }
        ],
        matchStartTime: new Date(Date.now() - 45 * 60 * 1000),
        status: 'LIVE',
        league: 'Champions League',
        venue: 'Signal Iduna Park',
        weather: 'Cold, 10°C',
        score: { home: 1, away: 1 }
      },
      // La Liga
      {
        apiMatchId: 'match_010',
        teams: [
          { name: 'Atletico Madrid', league: 'La Liga' },
          { name: 'Sevilla', league: 'La Liga' }
        ],
        matchStartTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
        status: 'UPCOMING',
        league: 'La Liga',
        venue: 'Wanda Metropolitano',
        weather: 'Warm, 25°C'
      },
      {
        apiMatchId: 'match_011',
        teams: [
          { name: 'Valencia', league: 'La Liga' },
          { name: 'Real Sociedad', league: 'La Liga' }
        ],
        matchStartTime: new Date(Date.now() + 36 * 60 * 60 * 1000),
        status: 'UPCOMING',
        league: 'La Liga',
        venue: 'Mestalla',
        weather: 'Hot, 28°C'
      },
      // Serie A
      {
        apiMatchId: 'match_012',
        teams: [
          { name: 'AS Roma', league: 'Serie A' },
          { name: 'Napoli', league: 'Serie A' }
        ],
        matchStartTime: new Date(Date.now() + 18 * 60 * 60 * 1000),
        status: 'UPCOMING',
        league: 'Serie A',
        venue: 'Stadio Olimpico',
        weather: 'Pleasant, 21°C'
      },
      {
        apiMatchId: 'match_013',
        teams: [
          { name: 'Atalanta', league: 'Serie A' },
          { name: 'Lazio', league: 'Serie A' }
        ],
        matchStartTime: new Date(Date.now() - 120 * 60 * 1000),
        status: 'COMPLETED',
        league: 'Serie A',
        venue: 'Gewiss Stadium',
        weather: 'Sunny, 23°C',
        score: { home: 1, away: 2 }
      },
      // Bundesliga
      {
        apiMatchId: 'match_014',
        teams: [
          { name: 'RB Leipzig', league: 'Bundesliga' },
          { name: 'Bayer Leverkusen', league: 'Bundesliga' }
        ],
        matchStartTime: new Date(Date.now() + 15 * 60 * 60 * 1000),
        status: 'UPCOMING',
        league: 'Bundesliga',
        venue: 'Red Bull Arena',
        weather: 'Chilly, 12°C'
      },
      {
        apiMatchId: 'match_015',
        teams: [
          { name: 'Eintracht Frankfurt', league: 'Bundesliga' },
          { name: 'VfB Stuttgart', league: 'Bundesliga' }
        ],
        matchStartTime: new Date(Date.now() - 60 * 60 * 1000),
        status: 'LIVE',
        league: 'Bundesliga',
        venue: 'Deutsche Bank Park',
        weather: 'Overcast, 13°C',
        score: { home: 2, away: 2 }
      },
      // FA Cup
      {
        apiMatchId: 'match_016',
        teams: [
          { name: 'Leicester City', league: 'FA Cup' },
          { name: 'Everton', league: 'FA Cup' }
        ],
        matchStartTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
        status: 'UPCOMING',
        league: 'FA Cup',
        venue: 'King Power Stadium',
        weather: 'Drizzle, 15°C'
      },
      // Europa League
      {
        apiMatchId: 'match_017',
        teams: [
          { name: 'Villarreal', league: 'Europa League' },
          { name: 'Ajax', league: 'Europa League' }
        ],
        matchStartTime: new Date(Date.now() + 96 * 60 * 60 * 1000),
        status: 'UPCOMING',
        league: 'Europa League',
        venue: 'Estadio de la Cerámica',
        weather: 'Warm, 24°C'
      },
      {
        apiMatchId: 'match_018',
        teams: [
          { name: 'Crystal Palace', league: 'Premier League' },
          { name: 'Burnley', league: 'Premier League' }
        ],
        matchStartTime: new Date(Date.now() - 20 * 60 * 1000),
        status: 'LIVE',
        league: 'Premier League',
        venue: 'Selhurst Park',
        weather: 'Windy, 14°C',
        score: { home: 1, away: 1 }
      },
      {
        apiMatchId: 'match_019',
        teams: [
          { name: 'FC Porto', league: 'Champions League' },
          { name: 'Benfica', league: 'Champions League' }
        ],
        matchStartTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
        status: 'CANCELLED',
        league: 'Champions League',
        venue: 'Estádio do Dragão',
        weather: 'Heavy Rain, 12°C'
      },
      {
        apiMatchId: 'match_020',
        teams: [
          { name: 'Liverpool', league: 'Premier League' },
          { name: 'Chelsea', league: 'Premier League' }
        ],
        matchStartTime: new Date(Date.now() + 10 * 60 * 60 * 1000),
        status: 'UPCOMING',
        league: 'Premier League',
        venue: 'Anfield',
        weather: 'Clear, 16°C'
      }
    ];

    const insertedMatches = await Match.insertMany(sampleMatches);
    console.log(`✅ Inserted ${insertedMatches.length} matches\n`);

    // Show match statistics
    const statusCounts = {};
    const leagueCounts = {};
    
    insertedMatches.forEach(match => {
      statusCounts[match.status] = (statusCounts[match.status] || 0) + 1;
      leagueCounts[match.league] = (leagueCounts[match.league] || 0) + 1;
    });

    console.log('📊 Match Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      const icon = status === 'LIVE' ? '🔴' : status === 'UPCOMING' ? '⏰' : status === 'COMPLETED' ? '✅' : '❌';
      console.log(`   ${icon} ${status}: ${count}`);
    });

    console.log('\n🏆 League Distribution:');
    Object.entries(leagueCounts).forEach(([league, count]) => {
      console.log(`   ${league}: ${count}`);
    });

    // ==========================================
    // STEP 2: Seed Live Scores
    // ==========================================
    console.log('\n📊 STEP 2: Seeding Live Scores');
    console.log('═══════════════════════════════');

    await LiveScore.deleteMany({});
    console.log('🗑️  Cleared existing live scores');

    const liveAndUpcomingMatches = insertedMatches.filter(m => 
      m.status === 'LIVE' || m.status === 'UPCOMING'
    );

    const liveScoresToInsert = [];

    for (const match of liveAndUpcomingMatches) {
      const isLive = match.status === 'LIVE';
      const homeScore = match.score?.home ?? 0;
      const awayScore = match.score?.away ?? 0;

      liveScoresToInsert.push({
        matchId: match._id,
        homeScore,
        awayScore,
        currentMinute: isLive ? Math.floor(Math.random() * 90) + 1 : 0,
        status: isLive ? (Math.random() > 0.5 ? 'FIRST_HALF' : 'SECOND_HALF') : 'NOT_STARTED',
        events: isLive ? [
          {
            minute: 15,
            type: 'GOAL',
            team: 'home',
            player: match.teams[0].name.split(' ').pop() + ' Player',
            description: 'Great strike',
            timestamp: new Date()
          }
        ] : [],
        stats: {
          possession: { home: 52, away: 48 },
          shots: { home: 8, away: 6 },
          shotsOnTarget: { home: 4, away: 3 },
          corners: { home: 5, away: 4 },
          fouls: { home: 8, away: 10 },
          yellowCards: { home: 1, away: 2 },
          redCards: { home: 0, away: 0 }
        }
      });
    }

    const insertedScores = await LiveScore.insertMany(liveScoresToInsert);
    console.log(`✅ Inserted ${insertedScores.length} live scores`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n═══════════════════════════════════════════');
    console.log('📋 Summary:');
    console.log(`   • Total Matches: ${insertedMatches.length}`);
    console.log(`   • Live Matches: ${statusCounts['LIVE'] || 0}`);
    console.log(`   • Upcoming Matches: ${statusCounts['UPCOMING'] || 0}`);
    console.log(`   • Completed Matches: ${statusCounts['COMPLETED'] || 0}`);
    console.log(`   • Live Scores: ${insertedScores.length}`);
    console.log('═══════════════════════════════════════════\n');

    console.log('🚀 Next Steps:');
    console.log('   1. Start the backend: npm start');
    console.log('   2. Start the frontend: npm start (in Frontend folder)');
    console.log('   3. (Optional) Run simulator: npm run simulate:livescores\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedAll();
