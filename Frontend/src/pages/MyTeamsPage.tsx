import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface Team {
  _id: string;
  name: string;
  matchId: string;
  contestId: string;
  matchName: string;
  matchDate: string;
  captain: {
    playerId: string;
    name: string;
    position: string;
  };
  viceCaptain: {
    playerId: string;
    name: string;
    position: string;
  };
  players: Array<{
    playerId: string;
    name: string;
    position: string;
    points: number;
    multiplier: number;
    credits: number;
    team: string;
  }>;
  totalPoints: number;
  totalCreditsUsed: number;
  rank: number | null;
  status: 'upcoming' | 'live' | 'completed';
  createdAt: string;
  updatedAt: string;
}

const MyTeamsPage: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live' | 'completed'>('all');
  const [selectedTeamForView, setSelectedTeamForView] = useState<Team | null>(null);
  const [stats, setStats] = useState({
    totalTeams: 0,
    topFinishes: 0,
    liveTeams: 0,
    avgPoints: 0
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchTeams = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem('play11_token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Fetch teams
        const teamsResponse = await fetch(`${API_URL}/api/teams?status=${filter === 'all' ? '' : filter}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          setTeams(teamsData);
        } else {
          console.error('Failed to fetch teams');
        }

        // Fetch stats
        const statsResponse = await fetch(`${API_URL}/api/teams/stats/summary`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats({
            totalTeams: statsData.totalTeams,
            topFinishes: statsData.topFinishes,
            liveTeams: statsData.liveTeams,
            avgPoints: statsData.avgPoints
          });
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [user, filter, API_URL]);

  const filteredTeams = teams.filter(team => 
    filter === 'all' || team.status === filter
  );

  const getStatusBadge = (status: Team['status']) => {
    const statusConfig = {
      upcoming: { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' },
      live: { label: 'Live', color: 'bg-red-100 text-red-800' },
      completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
        {status === 'live' && <span className="ml-1 animate-pulse">🔴</span>}
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Teams</h1>
          <p className="text-gray-600 mt-1">Manage and track all your fantasy teams</p>
        </div>
        <Link to="/dashboard/team-builder" className="btn-primary">
          Create New Team
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-primary-600 mb-1">{stats.totalTeams}</div>
          <div className="text-sm text-gray-600">Total Teams</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-2xl font-bold text-green-600 mb-1">
            {stats.topFinishes}
          </div>
          <div className="text-sm text-gray-600">Top 3 Finishes</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">⚽</div>
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {stats.liveTeams}
          </div>
          <div className="text-sm text-gray-600">Live Teams</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {stats.avgPoints}
          </div>
          <div className="text-sm text-gray-600">Avg Points</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="font-medium">Filter by status:</span>
          {(['all', 'upcoming', 'live', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({status === 'all' ? teams.length : teams.filter(t => t.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid gap-6">
        {filteredTeams.map((team, index) => (
          <motion.div
            key={team._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
                  {getStatusBadge(team.status)}
                </div>
                <p className="text-gray-600 text-sm">{team.matchName}</p>
                <p className="text-gray-500 text-xs">
                  Created {new Date(team.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">{team.totalPoints}</div>
                <div className="text-sm text-gray-600">Points</div>
                {team.rank && (
                  <div className="text-xs text-green-600 font-medium">Rank #{team.rank}</div>
                )}
              </div>
            </div>

            {/* Captain & Vice Captain */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="text-xs text-yellow-800 font-medium mb-1">CAPTAIN (2x)</div>
                <div className="font-semibold text-yellow-900">{team.captain.name}</div>
                <div className="text-xs text-yellow-700">{team.captain.position}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 font-medium mb-1">VICE CAPTAIN (1.5x)</div>
                <div className="font-semibold text-gray-900">{team.viceCaptain.name}</div>
                <div className="text-xs text-gray-600">{team.viceCaptain.position}</div>
              </div>
            </div>

            {/* Team Summary */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { key: 'GK', label: 'Goalkeepers' },
                { key: 'DEF', label: 'Defenders' },
                { key: 'MID', label: 'Midfielders' },
                { key: 'FWD', label: 'Forwards' }
              ].map(pos => {
                const positionPlayers = team.players.filter(p => p.position === pos.key);
                return (
                  <div key={pos.key} className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {positionPlayers.length}
                    </div>
                    <div className="text-xs text-gray-600">{pos.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Link
                to={`/dashboard/contests/${team.contestId}/leaderboard`}
                className="flex-1 btn-outline text-center text-sm"
              >
                View Contest
              </Link>
              <button
                onClick={() => setSelectedTeamForView(team)}
                className="flex-1 btn-outline text-center text-sm"
              >
                View Team
              </button>
              {team.status === 'upcoming' && (
                <Link
                  to={`/dashboard/team-builder?edit=${team._id}&contest=${team.contestId}`}
                  className="flex-1 btn-primary text-center text-sm"
                >
                  Edit Team
                </Link>
              )}
              {team.status === 'live' && (
                <button className="flex-1 btn-outline text-center text-sm">
                  Live Tracking
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'all' ? 'No teams found' : `No ${filter} teams`}
          </h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? 'Create your first fantasy team to get started!' 
              : `You don't have any ${filter} teams at the moment.`
            }
          </p>
          <Link to="/dashboard/team-builder" className="btn-primary">
            Create Your First Team
          </Link>
        </div>
      )}

      {/* Team View Modal */}
      {selectedTeamForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedTeamForView.name}</h2>
                <button
                  onClick={() => setSelectedTeamForView(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="card">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-1">
                      {selectedTeamForView.totalPoints}
                    </div>
                    <div className="text-sm text-gray-600">Total Points</div>
                  </div>
                </div>
                <div className="card">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {selectedTeamForView.rank || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Current Rank</div>
                  </div>
                </div>
                <div className="card">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {selectedTeamForView.totalCreditsUsed}
                    </div>
                    <div className="text-sm text-gray-600">Credits Used</div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="card bg-yellow-50">
                  <h3 className="font-bold text-yellow-800 mb-2">Captain (2x Points)</h3>
                  <div className="font-semibold text-yellow-900">{selectedTeamForView.captain.name}</div>
                  <div className="text-sm text-yellow-700">{selectedTeamForView.captain.position}</div>
                </div>
                <div className="card bg-gray-50">
                  <h3 className="font-bold text-gray-700 mb-2">Vice Captain (1.5x Points)</h3>
                  <div className="font-semibold text-gray-900">{selectedTeamForView.viceCaptain.name}</div>
                  <div className="text-sm text-gray-600">{selectedTeamForView.viceCaptain.position}</div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-bold text-gray-900 mb-4">Team Squad</h3>
                <div className="space-y-4">
                  {[
                    { key: 'GK', label: 'Goalkeepers', color: 'bg-yellow-50 border-yellow-200' },
                    { key: 'DEF', label: 'Defenders', color: 'bg-blue-50 border-blue-200' },
                    { key: 'MID', label: 'Midfielders', color: 'bg-green-50 border-green-200' },
                    { key: 'FWD', label: 'Forwards', color: 'bg-red-50 border-red-200' }
                  ].map(position => {
                    const positionPlayers = selectedTeamForView.players.filter(p => p.position === position.key);
                    return (
                      <div key={position.key}>
                        <h4 className="font-semibold text-gray-700 mb-2">{position.label}</h4>
                        <div className="grid gap-2">
                          {positionPlayers.map((player, index) => (
                            <div key={index} className={`p-3 rounded-lg border ${position.color}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium flex items-center space-x-2">
                                    <span>{player.name}</span>
                                    {player.playerId === selectedTeamForView.captain.playerId && (
                                      <span className="text-yellow-600 text-xs font-bold">(C)</span>
                                    )}
                                    {player.playerId === selectedTeamForView.viceCaptain.playerId && (
                                      <span className="text-blue-600 text-xs font-bold">(VC)</span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600">{player.team}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-primary-600">{player.points}</div>
                                  <div className="text-xs text-gray-500">{player.credits} credits</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTeamsPage;