import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { liveScores, isConnected } = useSocket();

  const featuredMatches = [
    {
      id: '1',
      homeTeam: { name: 'Manchester United', logo: '🔴' },
      awayTeam: { name: 'Liverpool', logo: '🔴' },
      startTime: '2024-03-15T15:00:00Z',
      contestCount: 24,
      prizePool: 50000
    },
    {
      id: '2',
      homeTeam: { name: 'Chelsea', logo: '🔵' },
      awayTeam: { name: 'Arsenal', logo: '🔴' },
      startTime: '2024-03-15T17:30:00Z',
      contestCount: 18,
      prizePool: 35000
    },
    {
      id: '3',
      homeTeam: { name: 'Manchester City', logo: '🔵' },
      awayTeam: { name: 'Tottenham', logo: '⚪' },
      startTime: '2024-03-16T14:00:00Z',
      contestCount: 32,
      prizePool: 75000
    }
  ];

  const userStats = [
    { label: 'Contests Won', value: user?.totalContests || 0, icon: '🏆' },
    { label: 'Total Winnings', value: `₹${user?.totalWinnings?.toLocaleString() || 0}`, icon: '💰' },
    { label: 'Win Rate', value: `${user?.winRate || 0}%`, icon: '📈' },
    { label: 'Current Balance', value: `₹${user?.balance?.toLocaleString() || 0}`, icon: '💳' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl shadow-lg"
      >
        {/* Enhanced gradient background with football theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-blue-600 to-emerald-700"></div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3Ccircle cx='15' cy='15' r='1'/%3E%3Ccircle cx='45' cy='15' r='1'/%3E%3Ccircle cx='15' cy='45' r='1'/%3E%3Ccircle cx='45' cy='45' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '60px 60px'
             }}>
        </div>
        
        {/* Glass morphism effect */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        
        <div className="relative z-10 p-6 md:p-8 text-white">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            Welcome to PLAY11
          </h1>
          <p className="text-lg md:text-xl mb-6 opacity-90 drop-shadow-md">
            Create your dream football team and win big!
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/dashboard/matches"
              className="bg-white/90 backdrop-blur-sm text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              View Matches
            </Link>
            <Link
              to="/dashboard/teams"
              className="border-2 border-white/80 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-700 transition-all duration-200 backdrop-blur-sm"
            >
              My Teams
            </Link>
          </div>
        </div>
        
        {/* Enhanced floating elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-green-400/20 rounded-full animate-bounce" style={{animationDuration: '3s'}}></div>
      </motion.div>

      {/* User Stats */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {userStats.map((stat, index) => (
            <div key={stat.label} className="card text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-primary-600 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Quick Action Cards - Live Scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
      >
        {/* Live Scores Card */}
        <Link to="/dashboard/live-scores" className="card card-hover group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">📡 Live Scores</h3>
              <p className="text-sm text-gray-600">Real-time match updates</p>
            </div>
            <div className={`px-3 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-xs font-semibold">{isConnected ? 'Live' : 'Offline'}</span>
              </div>
            </div>
          </div>
          
          {liveScores.length > 0 ? (
            <div className="space-y-2">
              {liveScores.slice(0, 2).map((score, idx) => (
                <div key={idx} className="p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex-1 text-right font-medium">{score.homeTeam}</div>
                    <div className="mx-3 px-3 py-1 bg-white rounded-md font-bold text-blue-600">
                      {score.homeScore} - {score.awayScore}
                    </div>
                    <div className="flex-1 text-left font-medium">{score.awayTeam}</div>
                  </div>
                  <div className="text-xs text-center text-gray-500 mt-1">
                    {score.currentMinute}' - {score.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">⚽</div>
              <div className="text-sm">No live matches at the moment</div>
            </div>
          )}
          
          <div className="mt-4 text-primary-600 group-hover:text-primary-700 font-medium text-sm flex items-center justify-center">
            View All Live Scores →
          </div>
        </Link>

        {/* Players Card */}
        <Link to="/dashboard/players" className="card card-hover group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">⭐ Top Players</h3>
              <p className="text-sm text-gray-600">Trending fantasy picks</p>
            </div>
            <div className="text-2xl">🔥</div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">⚽</div>
                <div>
                  <div className="font-medium text-sm">Mohamed Salah</div>
                  <div className="text-xs text-gray-500">Forward</div>
                </div>
              </div>
              <div className="text-sm font-semibold text-green-600">+156 pts</div>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm">⚽</div>
                <div>
                  <div className="font-medium text-sm">Erling Haaland</div>
                  <div className="text-xs text-gray-500">Forward</div>
                </div>
              </div>
              <div className="text-sm font-semibold text-green-600">+145 pts</div>
            </div>
          </div>
          
          <div className="mt-4 text-primary-600 group-hover:text-primary-700 font-medium text-sm flex items-center justify-center">
            Browse All Players →
          </div>
        </Link>
      </motion.div>

      {/* Featured Matches */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Matches</h2>
          <Link to="/dashboard/matches" className="text-primary-600 hover:text-primary-700 font-medium">
            View All →
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {featuredMatches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="card card-hover"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-center flex-1">
                  <div className="text-3xl mb-2">{match.homeTeam.logo}</div>
                  <div className="font-semibold text-sm">{match.homeTeam.name}</div>
                </div>
                <div className="text-2xl mx-4">VS</div>
                <div className="text-center flex-1">
                  <div className="text-3xl mb-2">{match.awayTeam.logo}</div>
                  <div className="font-semibold text-sm">{match.awayTeam.name}</div>
                </div>
              </div>
              
              <div className="text-center mb-4">
                <div className="text-sm text-gray-600 mb-1">
                  {new Date(match.startTime).toLocaleDateString()}
                </div>
                <div className="font-medium">
                  {new Date(match.startTime).toLocaleTimeString()}
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                <span>{match.contestCount} Contests</span>
                <span>₹{match.prizePool.toLocaleString()} Pool</span>
              </div>
              
              <Link
                to={`/dashboard/matches/${match.id}/contests`}
                className="w-full btn-primary text-center block"
              >
                Join Contest
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">🏆</span>
              </div>
              <div>
                <div className="font-medium">Won Premier League Contest</div>
                <div className="text-sm text-gray-600">2 hours ago</div>
              </div>
            </div>
            <div className="text-green-600 font-semibold">+₹2,500</div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">👥</span>
              </div>
              <div>
                <div className="font-medium">Created new team</div>
                <div className="text-sm text-gray-600">5 hours ago</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm">💰</span>
              </div>
              <div>
                <div className="font-medium">Joined Champions League Contest</div>
                <div className="text-sm text-gray-600">1 day ago</div>
              </div>
            </div>
            <div className="text-red-600 font-semibold">-₹100</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;