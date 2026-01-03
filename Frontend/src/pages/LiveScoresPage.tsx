import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const LiveScoresPage: React.FC = () => {
  const { liveScores, isConnected, joinAllLiveMatches } = useSocket();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all');

  useEffect(() => {
    // Join all live matches when component mounts
    joinAllLiveMatches();

    // Fetch initial live scores from API
    const fetchLiveScores = async () => {
      try {
        const response = await fetch(`${API_URL}/api/livescores/active`);
        if (response.ok) {
          const data = await response.json();
          console.log('Initial live scores loaded:', data.length);
        }
      } catch (error) {
        console.error('Error fetching live scores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveScores();
  }, [joinAllLiveMatches]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FIRST_HALF':
      case 'SECOND_HALF':
      case 'EXTRA_TIME':
        return 'bg-red-500 animate-pulse';
      case 'HALF_TIME':
        return 'bg-yellow-500';
      case 'FULL_TIME':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'FIRST_HALF':
        return '1st Half';
      case 'SECOND_HALF':
        return '2nd Half';
      case 'HALF_TIME':
        return 'HT';
      case 'FULL_TIME':
        return 'FT';
      case 'EXTRA_TIME':
        return 'ET';
      case 'PENALTIES':
        return 'Pens';
      default:
        return status;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'GOAL':
        return '⚽';
      case 'YELLOW_CARD':
        return '🟨';
      case 'RED_CARD':
        return '🟥';
      case 'SUBSTITUTION':
        return '🔄';
      case 'PENALTY':
        return '🎯';
      case 'OWN_GOAL':
        return '⚽🔴';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl blur-xl opacity-20"></div>
        <div className="relative bg-gradient-to-r from-blue-600 to-green-500 text-white p-8 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">⚽ Live Scores</h1>
              <p className="text-blue-100">Real-time match updates via WebSocket</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-white animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="text-sm font-semibold">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 bg-white rounded-xl p-2 shadow-sm">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'all' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All Matches ({liveScores.length})
        </button>
        <button
          onClick={() => setFilter('live')}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'live' 
              ? 'bg-red-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          🔴 Live
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'upcoming' 
              ? 'bg-green-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          ⏰ Upcoming
        </button>
      </div>

      {/* Live Scores List */}
      <AnimatePresence mode="popLayout">
        {liveScores.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm"
          >
            <div className="text-6xl mb-4">⚽</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Live Matches</h3>
            <p className="text-gray-500">Check back soon for live match updates</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {liveScores.map((score, index) => (
              <motion.div
                key={score.matchId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden"
              >
                <div className="p-6">
                  {/* Match Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`px-3 py-1 rounded-full text-white text-sm font-bold ${getStatusColor(score.status)}`}>
                      {getStatusLabel(score.status)}
                      {(score.status === 'FIRST_HALF' || score.status === 'SECOND_HALF') && (
                        <span className="ml-2">{score.currentMinute}'</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(score.lastUpdated).toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Score Display */}
                  <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 mb-6">
                    {/* Home Team */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">{score.homeTeam}</div>
                    </div>

                    {/* Score */}
                    <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-4 rounded-xl shadow-lg">
                      <div className="text-4xl font-bold text-center">
                        {score.homeScore} - {score.awayScore}
                      </div>
                    </div>

                    {/* Away Team */}
                    <div className="text-left">
                      <div className="text-2xl font-bold text-gray-800">{score.awayTeam}</div>
                    </div>
                  </div>

                  {/* Match Stats */}
                  {score.stats && (
                    <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Possession</div>
                        <div className="font-semibold">
                          {score.stats.possession?.home || 0}% - {score.stats.possession?.away || 0}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Shots</div>
                        <div className="font-semibold">
                          {score.stats.shots?.home || 0} - {score.stats.shots?.away || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Corners</div>
                        <div className="font-semibold">
                          {score.stats.corners?.home || 0} - {score.stats.corners?.away || 0}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Events */}
                  {score.events && score.events.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Recent Events:</div>
                      {score.events.slice(-5).reverse().map((event: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">{getEventIcon(event.type)}</span>
                            <span className="font-medium">{event.player || 'Player'}</span>
                            <span className="text-xs text-gray-500">({event.team})</span>
                          </div>
                          <div className="text-sm text-gray-600">{event.minute}'</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* WebSocket Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Real-time Updates</h4>
            <p className="text-sm text-blue-700">
              Live scores are automatically updated via WebSocket connection. 
              No need to refresh the page - updates appear instantly when match events occur!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveScoresPage;
