require('dotenv').config();
const mongoose = require('mongoose');
const Match = require('../models/match');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Real football matches data with various leagues and tournaments
const realMatchesData = [
  // Premier League Matches
  {
    apiMatchId: 'PL001',
    teams: [
      { name: 'Manchester United', league: 'Premier League' },
      { name: 'Liverpool', league: 'Premier League' }
    ],
    matchStartTime: new Date('2025-10-15T15:00:00Z'),
    status: 'UPCOMING',
    league: 'Premier League',
    venue: 'Old Trafford',
    weather: 'Clear, 18°C'
  },
  {
    apiMatchId: 'PL002',
    teams: [
      { name: 'Chelsea', league: 'Premier League' },
      { name: 'Arsenal', league: 'Premier League' }
    ],
    matchStartTime: new Date('2025-10-16T17:30:00Z'),
    status: 'UPCOMING',
    league: 'Premier League',
    venue: 'Stamford Bridge',
    weather: 'Cloudy, 16°C'
  },
  {
    apiMatchId: 'PL003',
    teams: [
      { name: 'Manchester City', league: 'Premier League' },
      { name: 'Tottenham', league: 'Premier League' }
    ],
    matchStartTime: new Date('2025-10-08T14:00:00Z'),
    status: 'LIVE',
    league: 'Premier League',
    venue: 'Etihad Stadium',
    weather: 'Rainy, 14°C',
    score: { home: 2, away: 1 }
  },
  {
    apiMatchId: 'PL004',
    teams: [
      { name: 'Newcastle United', league: 'Premier League' },
      { name: 'Brighton', league: 'Premier League' }
    ],
    matchStartTime: new Date('2025-10-05T12:30:00Z'),
    status: 'COMPLETED',
    league: 'Premier League',
    venue: 'St. James Park',
    weather: 'Sunny, 20°C',
    score: { home: 3, away: 1 }
  },
  {
    apiMatchId: 'PL005',
    teams: [
      { name: 'Aston Villa', league: 'Premier League' },
      { name: 'West Ham', league: 'Premier League' }
    ],
    matchStartTime: new Date('2025-10-12T16:00:00Z'),
    status: 'UPCOMING',
    league: 'Premier League',
    venue: 'Villa Park',
    weather: 'Partly Cloudy, 17°C'
  },

  // Champions League Matches
  {
    apiMatchId: 'UCL001',
    teams: [
      { name: 'Real Madrid', league: 'Champions League' },
      { name: 'Barcelona', league: 'Champions League' }
    ],
    matchStartTime: new Date('2025-10-20T20:00:00Z'),
    status: 'UPCOMING',
    league: 'Champions League',
    venue: 'Santiago Bernabéu',
    weather: 'Clear, 22°C'
  },
  {
    apiMatchId: 'UCL002',
    teams: [
      { name: 'PSG', league: 'Champions League' },
      { name: 'Bayern Munich', league: 'Champions League' }
    ],
    matchStartTime: new Date('2025-10-21T20:00:00Z'),
    status: 'UPCOMING',
    league: 'Champions League',
    venue: 'Parc des Princes',
    weather: 'Mild, 19°C'
  },
  {
    apiMatchId: 'UCL003',
    teams: [
      { name: 'AC Milan', league: 'Champions League' },
      { name: 'Inter Milan', league: 'Champions League' }
    ],
    matchStartTime: new Date('2025-10-19T18:45:00Z'),
    status: 'UPCOMING',
    league: 'Champions League',
    venue: 'San Siro',
    weather: 'Cool, 15°C'
  },
  {
    apiMatchId: 'UCL004',
    teams: [
      { name: 'Borussia Dortmund', league: 'Champions League' },
      { name: 'Juventus', league: 'Champions League' }
    ],
    matchStartTime: new Date('2025-10-03T20:00:00Z'),
    status: 'COMPLETED',
    league: 'Champions League',
    venue: 'Signal Iduna Park',
    weather: 'Cold, 10°C',
    score: { home: 2, away: 0 }
  },

  // La Liga Matches
  {
    apiMatchId: 'LL001',
    teams: [
      { name: 'Atletico Madrid', league: 'La Liga' },
      { name: 'Sevilla', league: 'La Liga' }
    ],
    matchStartTime: new Date('2025-10-14T21:00:00Z'),
    status: 'UPCOMING',
    league: 'La Liga',
    venue: 'Wanda Metropolitano',
    weather: 'Warm, 25°C'
  },
  {
    apiMatchId: 'LL002',
    teams: [
      { name: 'Valencia', league: 'La Liga' },
      { name: 'Real Sociedad', league: 'La Liga' }
    ],
    matchStartTime: new Date('2025-10-13T19:00:00Z'),
    status: 'UPCOMING',
    league: 'La Liga',
    venue: 'Mestalla',
    weather: 'Hot, 28°C'
  },

  // Serie A Matches
  {
    apiMatchId: 'SA001',
    teams: [
      { name: 'AS Roma', league: 'Serie A' },
      { name: 'Napoli', league: 'Serie A' }
    ],
    matchStartTime: new Date('2025-10-17T20:45:00Z'),
    status: 'UPCOMING',
    league: 'Serie A',
    venue: 'Stadio Olimpico',
    weather: 'Pleasant, 21°C'
  },
  {
    apiMatchId: 'SA002',
    teams: [
      { name: 'Atalanta', league: 'Serie A' },
      { name: 'Lazio', league: 'Serie A' }
    ],
    matchStartTime: new Date('2025-10-04T18:00:00Z'),
    status: 'COMPLETED',
    league: 'Serie A',
    venue: 'Gewiss Stadium',
    weather: 'Sunny, 23°C',
    score: { home: 1, away: 2 }
  },

  // Bundesliga Matches
  {
    apiMatchId: 'BL001',
    teams: [
      { name: 'RB Leipzig', league: 'Bundesliga' },
      { name: 'Bayer Leverkusen', league: 'Bundesliga' }
    ],
    matchStartTime: new Date('2025-10-18T15:30:00Z'),
    status: 'UPCOMING',
    league: 'Bundesliga',
    venue: 'Red Bull Arena',
    weather: 'Chilly, 12°C'
  },
  {
    apiMatchId: 'BL002',
    teams: [
      { name: 'Eintracht Frankfurt', league: 'Bundesliga' },
      { name: 'VfB Stuttgart', league: 'Bundesliga' }
    ],
    matchStartTime: new Date('2025-10-08T15:30:00Z'),
    status: 'LIVE',
    league: 'Bundesliga',
    venue: 'Deutsche Bank Park',
    weather: 'Overcast, 13°C',
    score: { home: 0, away: 1 }
  },

  // FA Cup Matches
  {
    apiMatchId: 'FAC001',
    teams: [
      { name: 'Leicester City', league: 'FA Cup' },
      { name: 'Everton', league: 'FA Cup' }
    ],
    matchStartTime: new Date('2025-10-22T19:45:00Z'),
    status: 'UPCOMING',
    league: 'FA Cup',
    venue: 'King Power Stadium',
    weather: 'Drizzle, 15°C'
  },

  // Europa League Matches
  {
    apiMatchId: 'EL001',
    teams: [
      { name: 'Villarreal', league: 'Europa League' },
      { name: 'Ajax', league: 'Europa League' }
    ],
    matchStartTime: new Date('2025-10-24T18:45:00Z'),
    status: 'UPCOMING',
    league: 'Europa League',
    venue: 'Estadio de la Cerámica',
    weather: 'Warm, 24°C'
  },

  // Some cancelled matches
  {
    apiMatchId: 'PL999',
    teams: [
      { name: 'Crystal Palace', league: 'Premier League' },
      { name: 'Burnley', league: 'Premier League' }
    ],
    matchStartTime: new Date('2025-10-11T15:00:00Z'),
    status: 'CANCELLED',
    league: 'Premier League',
    venue: 'Selhurst Park',
    weather: 'Storm, 8°C'
  },
  {
    apiMatchId: 'UCL999',
    teams: [
      { name: 'FC Porto', league: 'Champions League' },
      { name: 'Benfica', league: 'Champions League' }
    ],
    matchStartTime: new Date('2025-10-09T20:00:00Z'),
    status: 'CANCELLED',
    league: 'Champions League',
    venue: 'Estádio do Dragão',
    weather: 'Heavy Rain, 12°C'
  }
];

const seedRealMatches = async () => {
  try {
    await connectDB();
    
    // Clear existing matches
    console.log('🗑️ Clearing existing matches...');
    await Match.deleteMany({});
    
    // Insert real matches data
    console.log('🌱 Seeding real football matches...');
    const insertedMatches = await Match.insertMany(realMatchesData);
    
    console.log(`✅ Successfully inserted ${insertedMatches.length} real football matches!`);
    console.log('\n📊 Match Distribution:');
    
    // Show statistics
    const stats = await Match.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} matches`);
    });
    
    const leagueStats = await Match.aggregate([
      {
        $group: {
          _id: '$league',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n🏆 League Distribution:');
    leagueStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} matches`);
    });
    
    console.log('\n🎯 Sample matches created successfully!');
    console.log('You can now view these matches in your frontend application.');
    
  } catch (error) {
    console.error('❌ Error seeding matches:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding
seedRealMatches();