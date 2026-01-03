require('dotenv').config();
const mongoose = require('mongoose');
const Match = require('../models/match');

const sampleMatches = [
  // Premier League Matches
  {
    apiMatchId: 'match_001',
    teams: [
      { name: 'Manchester United', league: 'Premier League' },
      { name: 'Liverpool', league: 'Premier League' }
    ],
    matchStartTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
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
    matchStartTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
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
    matchStartTime: new Date(Date.now() - 30 * 60 * 1000), // Started 30 minutes ago
    status: 'LIVE',
    league: 'Premier League',
    venue: 'Etihad Stadium',
    weather: 'Rainy, 14°C',
    score: {
      home: 1,
      away: 0
    }
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
    matchStartTime: new Date(Date.now() - 90 * 60 * 1000), // Completed 90 mins ago
    status: 'COMPLETED',
    league: 'Premier League',
    venue: 'Villa Park',
    weather: 'Partly Cloudy, 17°C',
    score: {
      home: 2,
      away: 1
    }
  },
  // Champions League Matches
  {
    apiMatchId: 'match_006',
    teams: [
      { name: 'Real Madrid', league: 'Champions League' },
      { name: 'Barcelona', league: 'Champions League' }
    ],
    matchStartTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
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
    matchStartTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // Completed 2 hours ago
    status: 'COMPLETED',
    league: 'Champions League',
    venue: 'Parc des Princes',
    weather: 'Mild, 19°C',
    score: {
      home: 2,
      away: 3
    }
  },
  {
    apiMatchId: 'match_008',
    teams: [
      { name: 'AC Milan', league: 'Champions League' },
      { name: 'Inter Milan', league: 'Champions League' }
    ],
    matchStartTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days from now
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
    matchStartTime: new Date(Date.now() - 45 * 60 * 1000), // Live - 45 mins in
    status: 'LIVE',
    league: 'Champions League',
    venue: 'Signal Iduna Park',
    weather: 'Cold, 10°C',
    score: {
      home: 0,
      away: 1
    }
  },
  // La Liga Matches
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
  // Serie A Matches
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
    matchStartTime: new Date(Date.now() - 120 * 60 * 1000), // Completed
    status: 'COMPLETED',
    league: 'Serie A',
    venue: 'Gewiss Stadium',
    weather: 'Sunny, 23°C',
    score: {
      home: 1,
      away: 2
    }
  },
  // Bundesliga Matches
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
    matchStartTime: new Date(Date.now() - 60 * 60 * 1000), // Live
    status: 'LIVE',
    league: 'Bundesliga',
    venue: 'Deutsche Bank Park',
    weather: 'Overcast, 13°C',
    score: {
      home: 2,
      away: 2
    }
  },
  // FA Cup
  {
    apiMatchId: 'match_016',
    teams: [
      { name: 'Leicester City', league: 'FA Cup' },
      { name: 'Everton', league: 'FA Cup' }
    ],
    matchStartTime: new Date(Date.now() + 72 * 60 * 60 * 1000), // 3 days
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
    matchStartTime: new Date(Date.now() + 96 * 60 * 60 * 1000), // 4 days
    status: 'UPCOMING',
    league: 'Europa League',
    venue: 'Estadio de la Cerámica',
    weather: 'Warm, 24°C'
  },
  // More Premier League
  {
    apiMatchId: 'match_018',
    teams: [
      { name: 'Crystal Palace', league: 'Premier League' },
      { name: 'Burnley', league: 'Premier League' }
    ],
    matchStartTime: new Date(Date.now() - 20 * 60 * 1000), // Live - 20 mins
    status: 'LIVE',
    league: 'Premier League',
    venue: 'Selhurst Park',
    weather: 'Windy, 14°C',
    score: {
      home: 1,
      away: 1
    }
  },
  // Cancelled match
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

const seedMatches = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing matches
    await Match.deleteMany({});
    console.log('🗑️ Cleared existing matches');

    // Insert sample matches
    const insertedMatches = await Match.insertMany(sampleMatches);
    console.log(`✅ Inserted ${insertedMatches.length} sample matches`);

    insertedMatches.forEach(match => {
      console.log(`📍 Match: ${match.teams[0].name} vs ${match.teams[1].name} (ID: ${match._id})`);
    });

    console.log('🎉 Match seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding matches:', error);
    process.exit(1);
  }
};

seedMatches();