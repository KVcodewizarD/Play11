require('dotenv').config();
const mongoose = require('mongoose');
const Player = require('../models/player');

// Real football players with global rankings and positions
const footballPlayers = [
  // Goalkeepers (1-50 ranking)
  { name: 'Thibaut Courtois', position: 'GK', team: 'Real Madrid', country: 'Belgium', globalRanking: 1, credits: 10 },
  { name: 'Alisson Becker', position: 'GK', team: 'Liverpool', country: 'Brazil', globalRanking: 2, credits: 9.5 },
  { name: 'Manuel Neuer', position: 'GK', team: 'Bayern Munich', country: 'Germany', globalRanking: 3, credits: 9.5 },
  { name: 'Ederson', position: 'GK', team: 'Manchester City', country: 'Brazil', globalRanking: 4, credits: 9 },
  { name: 'Jan Oblak', position: 'GK', team: 'Atletico Madrid', country: 'Slovenia', globalRanking: 5, credits: 9 },
  { name: 'Gianluigi Donnarumma', position: 'GK', team: 'PSG', country: 'Italy', globalRanking: 6, credits: 8.5 },
  { name: 'Marc-Andre ter Stegen', position: 'GK', team: 'Barcelona', country: 'Germany', globalRanking: 7, credits: 8.5 },
  { name: 'Hugo Lloris', position: 'GK', team: 'Tottenham', country: 'France', globalRanking: 8, credits: 8 },
  { name: 'Keylor Navas', position: 'GK', team: 'PSG', country: 'Costa Rica', globalRanking: 9, credits: 8 },
  { name: 'Wojciech Szczesny', position: 'GK', team: 'Juventus', country: 'Poland', globalRanking: 10, credits: 7.5 },
  { name: 'Jordan Pickford', position: 'GK', team: 'Everton', country: 'England', globalRanking: 15, credits: 7 },
  { name: 'David de Gea', position: 'GK', team: 'Manchester United', country: 'Spain', globalRanking: 12, credits: 7.5 },
  { name: 'Kasper Schmeichel', position: 'GK', team: 'Leicester', country: 'Denmark', globalRanking: 18, credits: 6.5 },
  { name: 'Bernd Leno', position: 'GK', team: 'Arsenal', country: 'Germany', globalRanking: 20, credits: 6 },
  { name: 'Aaron Ramsdale', position: 'GK', team: 'Arsenal', country: 'England', globalRanking: 25, credits: 5.5 },
  
  // Defenders (1-200 ranking)
  { name: 'Virgil van Dijk', position: 'DEF', team: 'Liverpool', country: 'Netherlands', globalRanking: 11, credits: 10 },
  { name: 'Sergio Ramos', position: 'DEF', team: 'PSG', country: 'Spain', globalRanking: 13, credits: 9.5 },
  { name: 'Kalidou Koulibaly', position: 'DEF', team: 'Chelsea', country: 'Senegal', globalRanking: 14, credits: 9 },
  { name: 'Ruben Dias', position: 'DEF', team: 'Manchester City', country: 'Portugal', globalRanking: 16, credits: 9 },
  { name: 'Marquinhos', position: 'DEF', team: 'PSG', country: 'Brazil', globalRanking: 17, credits: 8.5 },
  { name: 'Raphael Varane', position: 'DEF', team: 'Manchester United', country: 'France', globalRanking: 19, credits: 8.5 },
  { name: 'Andrew Robertson', position: 'DEF', team: 'Liverpool', country: 'Scotland', globalRanking: 21, credits: 8 },
  { name: 'Trent Alexander-Arnold', position: 'DEF', team: 'Liverpool', country: 'England', globalRanking: 22, credits: 8 },
  { name: 'Joao Cancelo', position: 'DEF', team: 'Manchester City', country: 'Portugal', globalRanking: 23, credits: 8 },
  { name: 'Kyle Walker', position: 'DEF', team: 'Manchester City', country: 'England', globalRanking: 24, credits: 7.5 },
  { name: 'Thiago Silva', position: 'DEF', team: 'Chelsea', country: 'Brazil', globalRanking: 26, credits: 7.5 },
  { name: 'Reece James', position: 'DEF', team: 'Chelsea', country: 'England', globalRanking: 27, credits: 7 },
  { name: 'Ben Chilwell', position: 'DEF', team: 'Chelsea', country: 'England', globalRanking: 28, credits: 7 },
  { name: 'Harry Maguire', position: 'DEF', team: 'Manchester United', country: 'England', globalRanking: 35, credits: 6.5 },
  { name: 'Luke Shaw', position: 'DEF', team: 'Manchester United', country: 'England', globalRanking: 40, credits: 6 },
  { name: 'Ben White', position: 'DEF', team: 'Arsenal', country: 'England', globalRanking: 45, credits: 5.5 },
  { name: 'Gabriel Magalhaes', position: 'DEF', team: 'Arsenal', country: 'Brazil', globalRanking: 50, credits: 5 },
  { name: 'Kieran Tierney', position: 'DEF', team: 'Arsenal', country: 'Scotland', globalRanking: 55, credits: 4.5 },
  { name: 'Eric Dier', position: 'DEF', team: 'Tottenham', country: 'England', globalRanking: 60, credits: 4 },
  { name: 'Cristian Romero', position: 'DEF', team: 'Tottenham', country: 'Argentina', globalRanking: 52, credits: 5 },
  
  // Midfielders (1-300 ranking)
  { name: 'Kevin De Bruyne', position: 'MID', team: 'Manchester City', country: 'Belgium', globalRanking: 29, credits: 10 },
  { name: 'N\'Golo Kante', position: 'MID', team: 'Chelsea', country: 'France', globalRanking: 30, credits: 9.5 },
  { name: 'Luka Modric', position: 'MID', team: 'Real Madrid', country: 'Croatia', globalRanking: 31, credits: 9.5 },
  { name: 'Casemiro', position: 'MID', team: 'Manchester United', country: 'Brazil', globalRanking: 32, credits: 9 },
  { name: 'Joshua Kimmich', position: 'MID', team: 'Bayern Munich', country: 'Germany', globalRanking: 33, credits: 9 },
  { name: 'Bruno Fernandes', position: 'MID', team: 'Manchester United', country: 'Portugal', globalRanking: 34, credits: 8.5 },
  { name: 'Pedri', position: 'MID', team: 'Barcelona', country: 'Spain', globalRanking: 36, credits: 8.5 },
  { name: 'Frenkie de Jong', position: 'MID', team: 'Barcelona', country: 'Netherlands', globalRanking: 37, credits: 8 },
  { name: 'Jude Bellingham', position: 'MID', team: 'Real Madrid', country: 'England', globalRanking: 38, credits: 8 },
  { name: 'Rodri', position: 'MID', team: 'Manchester City', country: 'Spain', globalRanking: 39, credits: 7.5 },
  { name: 'Mason Mount', position: 'MID', team: 'Chelsea', country: 'England', globalRanking: 41, credits: 7.5 },
  { name: 'Jordan Henderson', position: 'MID', team: 'Liverpool', country: 'England', globalRanking: 42, credits: 7 },
  { name: 'Fabinho', position: 'MID', team: 'Liverpool', country: 'Brazil', globalRanking: 43, credits: 7 },
  { name: 'Thiago Alcantara', position: 'MID', team: 'Liverpool', country: 'Spain', globalRanking: 44, credits: 6.5 },
  { name: 'Bukayo Saka', position: 'MID', team: 'Arsenal', country: 'England', globalRanking: 46, credits: 6.5 },
  { name: 'Martin Odegaard', position: 'MID', team: 'Arsenal', country: 'Norway', globalRanking: 47, credits: 6 },
  { name: 'Thomas Partey', position: 'MID', team: 'Arsenal', country: 'Ghana', globalRanking: 48, credits: 5.5 },
  { name: 'Granit Xhaka', position: 'MID', team: 'Arsenal', country: 'Switzerland', globalRanking: 49, credits: 5 },
  { name: 'Pierre-Emile Hojbjerg', position: 'MID', team: 'Tottenham', country: 'Denmark', globalRanking: 51, credits: 4.5 },
  { name: 'Yves Bissouma', position: 'MID', team: 'Tottenham', country: 'Mali', globalRanking: 65, credits: 4 },
  
  // Forwards (1-200 ranking)
  { name: 'Lionel Messi', position: 'FWD', team: 'PSG', country: 'Argentina', globalRanking: 53, credits: 10 },
  { name: 'Cristiano Ronaldo', position: 'FWD', team: 'Al Nassr', country: 'Portugal', globalRanking: 54, credits: 10 },
  { name: 'Kylian Mbappe', position: 'FWD', team: 'PSG', country: 'France', globalRanking: 56, credits: 10 },
  { name: 'Erling Haaland', position: 'FWD', team: 'Manchester City', country: 'Norway', globalRanking: 57, credits: 9.5 },
  { name: 'Robert Lewandowski', position: 'FWD', team: 'Barcelona', country: 'Poland', globalRanking: 58, credits: 9.5 },
  { name: 'Karim Benzema', position: 'FWD', team: 'Al Ittihad', country: 'France', globalRanking: 59, credits: 9.5 },
  { name: 'Mohamed Salah', position: 'FWD', team: 'Liverpool', country: 'Egypt', globalRanking: 61, credits: 9 },
  { name: 'Sadio Mane', position: 'FWD', team: 'Bayern Munich', country: 'Senegal', globalRanking: 62, credits: 9 },
  { name: 'Neymar Jr', position: 'FWD', team: 'Al Hilal', country: 'Brazil', globalRanking: 63, credits: 8.5 },
  { name: 'Harry Kane', position: 'FWD', team: 'Bayern Munich', country: 'England', globalRanking: 64, credits: 8.5 },
  { name: 'Son Heung-min', position: 'FWD', team: 'Tottenham', country: 'South Korea', globalRanking: 66, credits: 8 },
  { name: 'Marcus Rashford', position: 'FWD', team: 'Manchester United', country: 'England', globalRanking: 67, credits: 7.5 },
  { name: 'Jadon Sancho', position: 'FWD', team: 'Manchester United', country: 'England', globalRanking: 68, credits: 7.5 },
  { name: 'Raheem Sterling', position: 'FWD', team: 'Chelsea', country: 'England', globalRanking: 69, credits: 7 },
  { name: 'Gabriel Jesus', position: 'FWD', team: 'Arsenal', country: 'Brazil', globalRanking: 70, credits: 6.5 },
  { name: 'Eddie Nketiah', position: 'FWD', team: 'Arsenal', country: 'England', globalRanking: 75, credits: 5.5 },
  { name: 'Gabriel Martinelli', position: 'FWD', team: 'Arsenal', country: 'Brazil', globalRanking: 71, credits: 6 },
  { name: 'Dejan Kulusevski', position: 'FWD', team: 'Tottenham', country: 'Sweden', globalRanking: 72, credits: 6 },
  { name: 'Richarlison', position: 'FWD', team: 'Tottenham', country: 'Brazil', globalRanking: 73, credits: 5.5 },
  { name: 'Darwin Nunez', position: 'FWD', team: 'Liverpool', country: 'Uruguay', globalRanking: 74, credits: 6 }
];

// Add more players with lower rankings for lower-tier users
const additionalPlayers = [
  // More Goalkeepers (lower tier)
  { name: 'Nick Pope', position: 'GK', team: 'Newcastle', country: 'England', globalRanking: 80, credits: 5 },
  { name: 'Robert Sanchez', position: 'GK', team: 'Brighton', country: 'Spain', globalRanking: 85, credits: 4.5 },
  { name: 'Jose Sa', position: 'GK', team: 'Wolves', country: 'Portugal', globalRanking: 90, credits: 4 },
  { name: 'Illan Meslier', position: 'GK', team: 'Leeds', country: 'France', globalRanking: 95, credits: 3.5 },
  { name: 'Vicente Guaita', position: 'GK', team: 'Crystal Palace', country: 'Spain', globalRanking: 100, credits: 3 },
  
  // More Defenders (lower tier)
  { name: 'Sven Botman', position: 'DEF', team: 'Newcastle', country: 'Netherlands', globalRanking: 105, credits: 4.5 },
  { name: 'Kieran Trippier', position: 'DEF', team: 'Newcastle', country: 'England', globalRanking: 110, credits: 4 },
  { name: 'Dan Burn', position: 'DEF', team: 'Newcastle', country: 'England', globalRanking: 120, credits: 3.5 },
  { name: 'Joel Matip', position: 'DEF', team: 'Liverpool', country: 'Cameroon', globalRanking: 115, credits: 4 },
  { name: 'Ibrahima Konate', position: 'DEF', team: 'Liverpool', country: 'France', globalRanking: 125, credits: 3.5 },
  { name: 'Nathan Ake', position: 'DEF', team: 'Manchester City', country: 'Netherlands', globalRanking: 130, credits: 3 },
  { name: 'John Stones', position: 'DEF', team: 'Manchester City', country: 'England', globalRanking: 135, credits: 3 },
  
  // More Midfielders (lower tier)
  { name: 'Bruno Guimaraes', position: 'MID', team: 'Newcastle', country: 'Brazil', globalRanking: 140, credits: 4 },
  { name: 'Joelinton', position: 'MID', team: 'Newcastle', country: 'Brazil', globalRanking: 145, credits: 3.5 },
  { name: 'Sean Longstaff', position: 'MID', team: 'Newcastle', country: 'England', globalRanking: 150, credits: 3 },
  { name: 'Harvey Elliott', position: 'MID', team: 'Liverpool', country: 'England', globalRanking: 155, credits: 3 },
  { name: 'Curtis Jones', position: 'MID', team: 'Liverpool', country: 'England', globalRanking: 160, credits: 2.5 },
  { name: 'Kalvin Phillips', position: 'MID', team: 'Manchester City', country: 'England', globalRanking: 165, credits: 3 },
  
  // More Forwards (lower tier)
  { name: 'Alexander Isak', position: 'FWD', team: 'Newcastle', country: 'Sweden', globalRanking: 170, credits: 4.5 },
  { name: 'Callum Wilson', position: 'FWD', team: 'Newcastle', country: 'England', globalRanking: 175, credits: 4 },
  { name: 'Miguel Almiron', position: 'FWD', team: 'Newcastle', country: 'Paraguay', globalRanking: 180, credits: 3.5 },
  { name: 'Diogo Jota', position: 'FWD', team: 'Liverpool', country: 'Portugal', globalRanking: 185, credits: 4 },
  { name: 'Roberto Firmino', position: 'FWD', team: 'Liverpool', country: 'Brazil', globalRanking: 190, credits: 3.5 },
  { name: 'Julian Alvarez', position: 'FWD', team: 'Manchester City', country: 'Argentina', globalRanking: 195, credits: 4 }
];

// Combine all players
const allPlayers = [...footballPlayers, ...additionalPlayers];

// Add realistic stats and form to each player
const playersWithStats = allPlayers.map(player => ({
  ...player,
  points: Math.floor(Math.random() * 200) + 50, // Random points between 50-250
  isPlaying: Math.random() > 0.1, // 90% chance of being available
  recentForm: Array.from({length: 5}, () => Math.floor(Math.random() * 10) + 1),
  avatar: `https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=150&sig=${player.name}`,
  stats: {
    goals: player.position === 'FWD' ? Math.floor(Math.random() * 30) : 
           player.position === 'MID' ? Math.floor(Math.random() * 15) : 
           Math.floor(Math.random() * 5),
    assists: player.position === 'MID' || player.position === 'FWD' ? 
             Math.floor(Math.random() * 20) : Math.floor(Math.random() * 8),
    cleanSheets: player.position === 'GK' || player.position === 'DEF' ? 
                 Math.floor(Math.random() * 20) : 0,
    saves: player.position === 'GK' ? Math.floor(Math.random() * 150) + 50 : 0,
    yellowCards: Math.floor(Math.random() * 8),
    redCards: Math.floor(Math.random() * 3),
    matchesPlayed: Math.floor(Math.random() * 15) + 15
  }
}));

const seedPlayers = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for player seeding...');
  
  await Player.deleteMany({}); // Clear existing players
  console.log('Old players deleted.');
  
  await Player.insertMany(playersWithStats);
  console.log(`${playersWithStats.length} football players have been added!`);
  
  mongoose.connection.close();
};

seedPlayers().catch(err => {
  console.error(err);
  mongoose.connection.close();
});