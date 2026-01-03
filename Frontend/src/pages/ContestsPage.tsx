import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Contest, ContestFilters } from '../types';

const API_URL = process.env.REACT_APP_API_URL;

const ContestsPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [contests, setContests] = useState<Contest[]>([]);
  // const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ContestFilters>({
    entryFee: { min: 0, max: 1000 },
    participants: { min: 0, max: 10000 },
    contestType: 'all',
    sortBy: 'entry_fee',
    sortOrder: 'asc'
  });
  const [loading, setLoading] = useState(true);

  // Mock contest data
  // const mockContests: Contest[] = [
  //   {
  //     id: 'contest-1',
  //     matchId: matchId || '1',
  //     name: 'Mega Contest',
  //     entryFee: 25,
  //     maxParticipants: 10000,
  //     currentParticipants: 8750,
  //     prizePool: 200000,
  //     maxTeamsPerUser: 11,
  //     isPrivate: false,
  //     createdBy: 'admin',
  //     prizeBreakup: [
  //       { rank: '1', prize: 50000, winnerCount: 1 },
  //       { rank: '2-3', prize: 25000, winnerCount: 2 },
  //       { rank: '4-10', prize: 10000, winnerCount: 7 }
  //     ],
  //     startTime: '2024-03-15T15:00:00Z',
  //     status: 'open',
  //     participants: []
  //   },
  //   {
  //     id: 'contest-2',
  //     matchId: matchId || '1',
  //     name: 'Head to Head',
  //     entryFee: 100,
  //     maxParticipants: 2,
  //     currentParticipants: 1,
  //     prizePool: 180,
  //     maxTeamsPerUser: 1,
  //     isPrivate: false,
  //     createdBy: 'user123',
  //     prizeBreakup: [
  //       { rank: '1', prize: 180, winnerCount: 1 }
  //     ],
  //     startTime: '2024-03-15T15:00:00Z',
  //     status: 'open',
  //     participants: []
  //   },
  //   {
  //     id: 'contest-3',
  //     matchId: matchId || '1',
  //     name: 'Private League',
  //     entryFee: 50,
  //     maxParticipants: 100,
  //     currentParticipants: 45,
  //     prizePool: 4500,
  //     maxTeamsPerUser: 3,
  //     isPrivate: true,
  //     privateCode: 'PLAY11FC',
  //     createdBy: 'league_admin',
  //     prizeBreakup: [
  //       { rank: '1', prize: 2000, winnerCount: 1 },
  //       { rank: '2-5', prize: 500, winnerCount: 4 },
  //       { rank: '6-20', prize: 100, winnerCount: 15 }
  //     ],
  //     startTime: '2024-03-15T15:00:00Z',
  //     status: 'open',
  //     participants: []
  //   }
  // ];

  useEffect(() => {
    const fetchContests = async () => {
      if (!matchId) return;
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/contests/match/${matchId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch contests');
        }
        const data = await response.json();
        
        // Transform backend contest data to match frontend expectations
        const formattedContests = data.map((contest: any) => {
          const prizePool = (contest.entryFee || 0) * (contest.maxParticipants || 0) * 0.9; // 10% platform fee
          const currentParticipants = contest.participants?.length || 0;
          
          return {
            id: contest._id,
            matchId: contest.match || matchId,
            name: contest.name || 'Unnamed Contest',
            entryFee: contest.entryFee || 0,
            maxParticipants: contest.maxParticipants || 100,
            currentParticipants: currentParticipants,
            prizePool: prizePool,
            maxTeamsPerUser: contest.maxTeamsPerUser || 1,
            isPrivate: contest.isPrivate || false,
            privateCode: contest.privateCode || undefined,
            createdBy: contest.createdBy || 'admin',
            prizeBreakup: contest.prizeBreakup || [
              { rank: '1', prize: prizePool * 0.6, winnerCount: 1 },
              { rank: '2-3', prize: prizePool * 0.2, winnerCount: 2 },
              { rank: '4-10', prize: prizePool * 0.02, winnerCount: 7 }
            ],
            startTime: contest.startTime || new Date().toISOString(),
            status: contest.status || 'open' as const,
            participants: contest.participants || []
          };
        });
        
        setContests(formattedContests);
      } catch (error) {
        console.error('Error fetching contests:', error);
        // Fallback to empty array on error
        setContests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, [matchId]);

  const getContestTypeLabel = (contest: Contest) => {
    if (contest.isPrivate) return 'Private';
    if (contest.maxParticipants <= 10) return 'Small';
    if (contest.maxParticipants <= 100) return 'Medium';
    return 'Mega';
  };

  const getParticipationPercentage = (contest: Contest) => {
    if (!contest.maxParticipants || contest.maxParticipants === 0) return 0;
    return Math.min(100, (contest.currentParticipants / contest.maxParticipants) * 100);
  };

  const getStatusBadge = (contest: Contest) => {
    const config = {
      open: { label: 'Open', color: 'bg-green-100 text-green-800' },
      closed: { label: 'Closed', color: 'bg-red-100 text-red-800' },
      live: { label: 'Live', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Cancelled', color: 'bg-yellow-100 text-yellow-800' }
    };

    // Fallback for undefined or unknown status
    const statusConfig = config[contest.status] || { label: 'Open', color: 'bg-green-100 text-green-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        {statusConfig.label}
      </span>
    );
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
        <h1 className="text-3xl font-bold text-gray-900">Choose Contest</h1>
        <Link
          to={`/dashboard/create-contest/${matchId}`}
          className="btn-primary"
        >
          Create Contest
        </Link>
      </div>

      {/* Match Info */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl mb-1">🔴</div>
              <div className="font-semibold text-sm">Manchester United</div>
            </div>
            <div className="text-xl mx-4">VS</div>
            <div className="text-center">
              <div className="text-2xl mb-1">🔴</div>
              <div className="font-semibold text-sm">Liverpool</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">March 15, 2024</div>
            <div className="font-medium">3:00 PM</div>
            <div className="text-xs text-primary-600">2h 30m left</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            className="input-field w-auto"
            value={filters.contestType}
            onChange={(e) => setFilters(prev => ({ ...prev, contestType: e.target.value as any }))}
          >
            <option value="all">All Contests</option>
            <option value="public">Public Only</option>
            <option value="private">Private Only</option>
          </select>
          
          <select
            className="input-field w-auto"
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
          >
            <option value="entry_fee">Sort by Entry Fee</option>
            <option value="participants">Sort by Participants</option>
            <option value="prize_pool">Sort by Prize Pool</option>
          </select>
        </div>
      </div>

      {/* Contests List */}
      <div className="space-y-4">
        {contests.map((contest, index) => (
          <motion.div
            key={contest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card card-hover"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold">{contest.name}</h3>
                {getStatusBadge(contest)}
                {contest.isPrivate && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                    Private
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ₹{contest.prizePool.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Prize Pool</div>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-primary-600">₹{contest.entryFee}</div>
                <div className="text-xs text-gray-500">Entry Fee</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">
                  {contest.currentParticipants}/{contest.maxParticipants}
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
                <span>Filling Fast</span>
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
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Prize Breakdown:</div>
              <div className="flex flex-wrap gap-2">
                {contest.prizeBreakup?.slice(0, 3).map((prize, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {prize.rank}: ₹{Math.round(prize.prize).toLocaleString()}
                  </span>
                )) || <span className="text-xs text-gray-500">Prize breakdown not available</span>}
                {contest.prizeBreakup && contest.prizeBreakup.length > 3 && (
                  <span className="text-xs text-gray-500">+{contest.prizeBreakup.length - 3} more</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Link
                to={`/dashboard/contests/${contest.id}/create-team`}
                className="flex-1 btn-primary text-center"
              >
                Join Contest
              </Link>
              <Link
                to={`/dashboard/contests/${contest.id}/leaderboard`}
                className="flex-1 btn-outline text-center"
              >
                View Details
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {contests.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No contests available</h3>
          <p className="text-gray-600 mb-4">Be the first to create a contest for this match!</p>
          <Link to={`/dashboard/create-contest/${matchId}`} className="btn-primary">
            Create Contest
          </Link>
        </div>
      )}
    </div>
  );
};

export default ContestsPage;