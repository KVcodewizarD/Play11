import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface Contest {
  _id: string;
  name: string;
  entryFee: number;
  maxParticipants: number;
  maxTeamsPerUser: number;
  participants?: string[];
  isPrivate: boolean;
  privateCode?: string;
  status: 'open' | 'closed' | 'live' | 'completed' | 'cancelled';
  createdBy?: {
    _id: string;
    username?: string;
    email: string;
  };
  match?: {
    _id: string;
    teams?: Array<{ name: string }>;
    matchStartTime?: string;
    status?: string;
  };
  prizeBreakup?: Array<{
    rank: string;
    prize: number;
    winnerCount: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

const ContestsListPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'created' | 'participated'>('all');
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContests = async (type: 'all' | 'created' | 'participated') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('play11_token');
      let endpoint = '';
      
      switch (type) {
        case 'created':
          endpoint = `${API_URL}/api/contests/my-created`;
          break;
        case 'participated':
          endpoint = `${API_URL}/api/contests/my-participated`;
          break;
        default:
          endpoint = `${API_URL}/api/contests?limit=100`;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token && (type === 'created' || type === 'participated')) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch contests');
      }
      
      const data = await response.json();
      // Ensure data is an array and filter out invalid contests
      const validContests = Array.isArray(data) ? data.filter(contest => 
        contest && 
        typeof contest === 'object' && 
        contest._id && 
        contest.name
      ) : [];
      setContests(validContests);
    } catch (error) {
      console.error('Error fetching contests:', error);
      toast.error('Failed to load contests');
      setContests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch contests if authentication is complete and we have a user for protected routes
    if (!authLoading) {
      if (activeTab === 'all' || (user && user.id)) {
        fetchContests(activeTab);
      }
    }
  }, [activeTab, authLoading, user]);

  const getStatusBadge = (status: string) => {
    const config = {
      open: { label: 'Open', color: 'bg-green-100 text-green-800' },
      closed: { label: 'Closed', color: 'bg-red-100 text-red-800' },
      live: { label: 'Live', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Cancelled', color: 'bg-yellow-100 text-yellow-800' }
    };

    const statusConfig = config[status as keyof typeof config] || { label: 'Open', color: 'bg-green-100 text-green-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        {statusConfig.label}
      </span>
    );
  };

  const calculatePrizePool = (contest: Contest) => {
    return contest.entryFee * contest.maxParticipants * 0.9; // 10% platform fee
  };

  const getParticipationPercentage = (contest: Contest) => {
    if (!contest.maxParticipants || contest.maxParticipants === 0) return 0;
    const participantsLength = contest.participants?.length || 0;
    return Math.min(100, (participantsLength / contest.maxParticipants) * 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const joinContest = async (contestId: string) => {
    try {
      const token = localStorage.getItem('play11_token');
      if (!token) {
        toast.error('Please login to join contests');
        return;
      }

      const response = await fetch(`${API_URL}/api/contests/${contestId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to join contest');
      }

      toast.success('Successfully joined contest!');
      fetchContests(activeTab); // Refresh the list
    } catch (error) {
      console.error('Error joining contest:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to join contest');
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Add error boundary protection
  try {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Contests</h1>
        <Link to="/dashboard/matches" className="btn-primary">
          Create New Contest
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'all', label: 'All Contests', icon: '🏅' },
            { id: 'created', label: 'Created by Me', icon: '⭐' },
            { id: 'participated', label: 'Joined Contests', icon: '🎯' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contests Grid */}
      <div className="grid gap-6">
        {contests
          .filter(contest => contest && contest._id && contest.name) // Filter out invalid contests
          .map((contest, index) => (
          <motion.div
            key={contest._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card card-hover"
          >
            {/* Contest Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold">{contest.name}</h3>
                {getStatusBadge(contest.status)}
                {contest.isPrivate && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                    Private
                  </span>
                )}
                {activeTab === 'all' && user?.id && contest.createdBy?._id === user.id && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    Created by You
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ₹{calculatePrizePool(contest).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Prize Pool</div>
              </div>
            </div>

            {/* Match Info */}
            {contest.match && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-xl mb-1">🔴</div>
                      <div className="font-semibold text-sm">{contest.match.teams?.[0]?.name || 'Team A'}</div>
                    </div>
                    <div className="text-lg mx-2">VS</div>
                    <div className="text-center">
                      <div className="text-xl mb-1">🔵</div>
                      <div className="font-semibold text-sm">{contest.match.teams?.[1]?.name || 'Team B'}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {contest.match.matchStartTime ? formatDate(contest.match.matchStartTime) : 'TBD'}
                  </div>
                </div>
              </div>
            )}

            {/* Contest Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-primary-600">₹{contest.entryFee}</div>
                <div className="text-xs text-gray-500">Entry Fee</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">
                  {contest.participants?.length || 0}/{contest.maxParticipants}
                </div>
                <div className="text-xs text-gray-500">Participants</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{contest.maxTeamsPerUser}</div>
                <div className="text-xs text-gray-500">Max Teams</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">
                  {contest.prizeBreakup?.reduce((sum, p) => sum + p.winnerCount, 0) || 0}
                </div>
                <div className="text-xs text-gray-500">Winners</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Filling {getParticipationPercentage(contest) > 80 ? 'Fast' : 'Slowly'}</span>
                <span>{Math.round(getParticipationPercentage(contest))}% Full</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getParticipationPercentage(contest)}%` }}
                ></div>
              </div>
            </div>

            {/* Prize Breakdown */}
            {contest.prizeBreakup && contest.prizeBreakup.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-medium mb-2">Prize Breakdown:</div>
                <div className="flex flex-wrap gap-2">
                  {contest.prizeBreakup.slice(0, 3).map((prize, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {prize.rank}: ₹{Math.round(prize.prize).toLocaleString()}
                    </span>
                  ))}
                  {contest.prizeBreakup.length > 3 && (
                    <span className="text-xs text-gray-500">+{contest.prizeBreakup.length - 3} more</span>
                  )}
                </div>
              </div>
            )}

            {/* Contest Details */}
            <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
              <div>
                Created by: {contest.createdBy?.username || contest.createdBy?.email || 'Unknown'}
              </div>
              <div>
                Created: {formatDate(contest.createdAt)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              {contest.status === 'open' && user?.id && !contest.participants?.includes(user.id) && (
                <button
                  onClick={() => joinContest(contest._id)}
                  className="flex-1 btn-primary"
                >
                  Join Contest
                </button>
              )}
              
              {user?.id && contest.participants?.includes(user.id) && (
                <Link
                  to={`/dashboard/contests/${contest._id}/create-team`}
                  className="flex-1 btn-primary text-center"
                >
                  Create Team
                </Link>
              )}
              
              <Link
                to={`/dashboard/contests/${contest._id}/leaderboard`}
                className="flex-1 btn-outline text-center"
              >
                View Details
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {contests.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            {activeTab === 'created' ? '🎯' : activeTab === 'participated' ? '🏅' : '📋'}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {activeTab === 'created' && 'No contests created yet'}
            {activeTab === 'participated' && 'No contests joined yet'}
            {activeTab === 'all' && 'No contests available'}
          </h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'created' && 'Start by creating your first contest!'}
            {activeTab === 'participated' && 'Join some contests to get started!'}
            {activeTab === 'all' && 'Check back later for new contests!'}
          </p>
          <Link to="/dashboard/matches" className="btn-primary">
            {activeTab === 'created' ? 'Create Contest' : 'Browse Matches'}
          </Link>
        </div>
      )}
    </div>
  );
  } catch (error) {
    console.error('Error rendering ContestsListPage:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">Please refresh the page or try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

export default ContestsListPage;