import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';
import { LeaderboardEntry } from '../types';

interface GlobalLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  totalWinnings: number;
  totalContests: number;
  winRate: number;
  totalPoints: number;
  badges: number;
  isCurrentUser?: boolean;
}

const LeaderboardPage: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const [searchParams] = useSearchParams();
  const { leaderboardUpdates } = useSocket();
  const [activeTab, setActiveTab] = useState<'global' | 'contest'>(contestId ? 'contest' : 'global');
  const [contestLeaderboard, setContestLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<GlobalLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContest, setSelectedContest] = useState(contestId || 'contest-1');

  // Mock contest leaderboard data
  const mockContestLeaderboard: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: 'user1',
      username: 'FootballKing',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      teamName: 'Dream Attackers',
      totalPoints: 245,
      captain: 'Mohamed Salah',
      viceCaptain: 'Kevin De Bruyne'
    },
    {
      rank: 2,
      userId: 'user2',
      username: 'GoalMaster',
      teamName: 'Victory Squad',
      totalPoints: 238,
      captain: 'Harry Kane',
      viceCaptain: 'Bruno Fernandes'
    },
    {
      rank: 3,
      userId: 'user3',
      username: 'ChampionFC',
      teamName: 'Elite Eleven',
      totalPoints: 235,
      captain: 'Erling Haaland',
      viceCaptain: 'Virgil van Dijk'
    },
    {
      rank: 4,
      userId: 'user4',
      username: 'TacticalGenius',
      teamName: 'Strategic Stars',
      totalPoints: 232,
      captain: 'Kevin De Bruyne',
      viceCaptain: 'Mohamed Salah',
      isCurrentUser: true
    },
    {
      rank: 5,
      userId: 'user5',
      username: 'ScorePredictor',
      teamName: 'Point Hunters',
      totalPoints: 228,
      captain: 'Kylian Mbappé',
      viceCaptain: 'Luka Modrić'
    }
  ];

  // Mock global leaderboard data
  const mockGlobalLeaderboard: GlobalLeaderboardEntry[] = [
    {
      rank: 1,
      userId: 'user1',
      username: 'FootballKing',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      totalWinnings: 125000,
      totalContests: 89,
      winRate: 78.5,
      totalPoints: 15420,
      badges: 12
    },
    {
      rank: 2,
      userId: 'user2',
      username: 'GoalMaster',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      totalWinnings: 98500,
      totalContests: 76,
      winRate: 72.3,
      totalPoints: 14890,
      badges: 9
    },
    {
      rank: 3,
      userId: 'user3',
      username: 'ChampionFC',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      totalWinnings: 87300,
      totalContests: 65,
      winRate: 69.8,
      totalPoints: 13980,
      badges: 8
    },
    {
      rank: 4,
      userId: 'user4',
      username: 'TacticalGenius',
      totalWinnings: 76400,
      totalContests: 58,
      winRate: 67.2,
      totalPoints: 12750,
      badges: 7,
      isCurrentUser: true
    },
    {
      rank: 5,
      userId: 'user5',
      username: 'ScorePredictor',
      avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150',
      totalWinnings: 65200,
      totalContests: 52,
      winRate: 63.5,
      totalPoints: 11890,
      badges: 6
    },
    {
      rank: 6,
      userId: 'user6',
      username: 'FantasyMaster',
      totalWinnings: 54300,
      totalContests: 45,
      winRate: 60.0,
      totalPoints: 10980,
      badges: 5
    },
    {
      rank: 7,
      userId: 'user7',
      username: 'WinStreak',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      totalWinnings: 48700,
      totalContests: 41,
      winRate: 58.5,
      totalPoints: 9870,
      badges: 4
    },
    {
      rank: 8,
      userId: 'user8',
      username: 'PointHunter',
      totalWinnings: 42100,
      totalContests: 38,
      winRate: 55.3,
      totalPoints: 9120,
      badges: 4
    }
  ];

  const availableContests = [
    { id: 'contest-1', name: 'Premier League Special', participants: 1250, prizePool: 50000 },
    { id: 'contest-2', name: 'Champions League Final', participants: 2500, prizePool: 100000 },
    { id: 'contest-3', name: 'Weekend Warriors', participants: 800, prizePool: 25000 },
    { id: 'contest-4', name: 'Daily Fantasy', participants: 500, prizePool: 15000 }
  ];

  useEffect(() => {
    const fetchLeaderboards = async () => {
      setLoading(true);
      try {
        // Fetch global leaderboard from backend
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/users/leaderboard`);
        
        if (response.ok) {
          const data = await response.json();
          // Map backend data to expected frontend format
          const mappedData = data.map((item: any) => ({
            rank: item.rank,
            userId: item.username + '_id', // Generate a userId since backend doesn't return it
            username: item.username,
            avatar: undefined,
            totalWinnings: item.totalWinnings || 0,
            totalContests: item.contestsPlayed || 0,
            winRate: item.winRate || 0,
            totalPoints: item.rankPoints || 0, // Backend uses rankPoints instead of totalPoints
            badges: 0 // Not available in backend yet
          }));
          setGlobalLeaderboard(mappedData);
        } else {
          // Fall back to mock data if API fails
          setGlobalLeaderboard(mockGlobalLeaderboard);
        }
        
        // Always use mock data for contest leaderboard for now
        setContestLeaderboard(mockContestLeaderboard);
      } catch (error) {
        console.error('Error fetching leaderboards:', error);
        // Use mock data as fallback
        setGlobalLeaderboard(mockGlobalLeaderboard);
        setContestLeaderboard(mockContestLeaderboard);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, [selectedContest]);

  useEffect(() => {
    // Update contest leaderboard with real-time data
    if (leaderboardUpdates.length > 0 && activeTab === 'contest') {
      setContestLeaderboard(leaderboardUpdates);
    }
  }, [leaderboardUpdates, activeTab]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getPointsColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600';
    if (rank === 2) return 'text-gray-600';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Leaderboards</h1>
        {activeTab === 'contest' && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live Updates</span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="card">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('global')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'global'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🌍 Global Rankings
          </button>
          <button
            onClick={() => setActiveTab('contest')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'contest'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏆 Contest Rankings
          </button>
        </div>
      </div>

      {/* Global Leaderboard */}
      {activeTab === 'global' && (
        <>
          {/* Global Stats */}
          <div className="card">
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600">2.5M+</div>
                <div className="text-sm text-gray-600">Total Players</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">₹50Cr+</div>
                <div className="text-sm text-gray-600">Total Winnings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">15,420</div>
                <div className="text-sm text-gray-600">Active Contests</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">98.5%</div>
                <div className="text-sm text-gray-600">Payout Rate</div>
              </div>
            </div>
          </div>

          {/* Global Rankings */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Top Players of All Time</h2>
            
            <div className="space-y-3">
              {globalLeaderboard.map((entry, index) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border transition-all ${
                    entry.isCurrentUser
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="text-2xl font-bold w-12 text-center">
                        {getRankBadge(entry.rank)}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center space-x-3">
                        {entry.avatar ? (
                          <img
                            src={entry.avatar}
                            alt={entry.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-semibold">
                              {entry.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-semibold flex items-center space-x-2">
                            <span>{entry.username}</span>
                            {entry.badges > 0 && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                {entry.badges} 🏆
                              </span>
                            )}
                            {entry.isCurrentUser && (
                              <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {(entry.totalContests || 0)} contests • {(entry.winRate || 0).toFixed(1)}% win rate
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Total Winnings</div>
                        <div className="font-bold text-green-600">₹{(entry.totalWinnings || 0).toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Total Points</div>
                        <div className={`text-xl font-bold ${getPointsColor(entry.rank)}`}>
                          {(entry.totalPoints || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Mobile Stats */}
                    <div className="md:hidden text-right">
                      <div className={`text-xl font-bold ${getPointsColor(entry.rank)}`}>
                        {(entry.totalPoints || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        ₹{(entry.totalWinnings || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-6">
              <button className="btn-outline">
                Load More Players
              </button>
            </div>
          </div>
        </>
      )}

      {/* Contest Leaderboard */}
      {activeTab === 'contest' && (
        <>
          {/* Contest Selection */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Select Contest</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {availableContests.map((contest) => (
                <button
                  key={contest.id}
                  onClick={() => setSelectedContest(contest.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedContest === contest.id
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{contest.name}</div>
                  <div className="text-sm text-gray-600">
                    {(contest.participants || 0).toLocaleString()} players • ₹{(contest.prizePool || 0).toLocaleString()} pool
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Contest Info */}
          <div className="card">
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600">
                  {availableContests.find(c => c.id === selectedContest)?.participants?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600">Total Participants</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{availableContests.find(c => c.id === selectedContest)?.prizePool?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600">Prize Pool</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">45:23</div>
                <div className="text-sm text-gray-600">Time Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">156</div>
                <div className="text-sm text-gray-600">Winners</div>
              </div>
            </div>
          </div>

          {/* Contest Rankings */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Live Contest Rankings</h2>
            
            <div className="space-y-3">
              {contestLeaderboard.map((entry, index) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border transition-all ${
                    entry.isCurrentUser
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="text-2xl font-bold w-12 text-center">
                        {getRankBadge(entry.rank)}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center space-x-3">
                        {entry.avatar ? (
                          <img
                            src={entry.avatar}
                            alt={entry.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-semibold">
                              {entry.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-semibold">
                            {entry.username}
                            {entry.isCurrentUser && (
                              <span className="ml-2 text-xs bg-primary-600 text-white px-2 py-1 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{entry.teamName}</div>
                        </div>
                      </div>
                    </div>

                    {/* Team Details */}
                    <div className="hidden md:flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Captain</div>
                        <div className="font-medium">{entry.captain}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Vice Captain</div>
                        <div className="font-medium">{entry.viceCaptain}</div>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getPointsColor(entry.rank)}`}>
                        {entry.totalPoints}
                      </div>
                      <div className="text-sm text-gray-600">Points</div>
                    </div>
                  </div>

                  {/* Mobile Team Details */}
                  <div className="md:hidden mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-600">Captain: </span>
                        <span className="font-medium">{entry.captain}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">VC: </span>
                        <span className="font-medium">{entry.viceCaptain}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-6">
              <button className="btn-outline">
                Load More Rankings
              </button>
            </div>
          </div>

          {/* Prize Breakdown */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Prize Breakdown</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium">1st Place</span>
                <span className="font-bold text-yellow-600">₹15,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">2nd Place</span>
                <span className="font-bold text-gray-600">₹8,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="font-medium">3rd Place</span>
                <span className="font-bold text-orange-600">₹5,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">4th - 10th Place</span>
                <span className="font-bold text-blue-600">₹2,000 each</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">11th - 156th Place</span>
                <span className="font-bold text-green-600">₹100 each</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LeaderboardPage;