import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { UserTeam } from '../types';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'teams' | 'stats' | 'badges'>('teams');

  // Mock user teams data
  const mockTeams: UserTeam[] = [
    {
      id: 'team-1',
      name: 'Dream Warriors',
      contestId: 'contest-1',
      players: [],
      captain: 'Mohamed Salah',
      viceCaptain: 'Kevin De Bruyne',
      totalCredits: 98.5,
      totalPoints: 245,
      createdAt: '2024-03-10T10:00:00Z',
      isSubmitted: true
    },
    {
      id: 'team-2',
      name: 'Victory Squad',
      contestId: 'contest-2',
      players: [],
      captain: 'Harry Kane',
      viceCaptain: 'Bruno Fernandes',
      totalCredits: 99.0,
      totalPoints: 189,
      createdAt: '2024-03-12T14:30:00Z',
      isSubmitted: true
    }
  ];

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
        <p className="text-gray-600">You need to be logged in to view your profile.</p>
      </div>
    );
  }

  const renderTeamsTab = () => (
    <div className="space-y-4">
      {mockTeams.map((team, index) => (
        <motion.div
          key={team.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{team.name}</h3>
              <p className="text-sm text-gray-600">
                Created on {new Date(team.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">{team.totalPoints}</div>
              <div className="text-xs text-gray-500">Points</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="font-semibold">{team.captain}</div>
              <div className="text-xs text-gray-500">Captain (2x)</div>
            </div>
            <div>
              <div className="font-semibold">{team.viceCaptain}</div>
              <div className="text-xs text-gray-500">Vice Captain (1.5x)</div>
            </div>
            <div>
              <div className="font-semibold">{team.totalCredits}</div>
              <div className="text-xs text-gray-500">Credits Used</div>
            </div>
            <div>
              <div className={`font-semibold ${
                team.isSubmitted ? 'text-green-600' : 'text-orange-600'
              }`}>
                {team.isSubmitted ? 'Submitted' : 'Draft'}
              </div>
              <div className="text-xs text-gray-500">Status</div>
            </div>
          </div>
        </motion.div>
      ))}
      
      {mockTeams.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No teams yet</h3>
          <p className="text-gray-600">Start creating teams to see them here!</p>
        </div>
      )}
    </div>
  );

  const renderStatsTab = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Performance Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Contests</span>
            <span className="font-semibold">{user.totalContests}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Contests Won</span>
            <span className="font-semibold text-green-600">12</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Win Rate</span>
            <span className="font-semibold">{user.winRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Winnings</span>
            <span className="font-semibold text-green-600">₹{user.totalWinnings.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Current Balance</span>
            <span className="font-semibold text-primary-600">₹{user.balance.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Performance</h3>
        <div className="space-y-2">
          {[85, 92, 78, 110, 95].map((score, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Contest {index + 1}</span>
              <span className={`font-semibold ${
                score >= 100 ? 'text-green-600' : score >= 80 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {score} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBadgesTab = () => (
    <div className="grid md:grid-cols-3 gap-4">
      {user.badges.map((badge, index) => (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="card text-center"
        >
          <div className="text-4xl mb-3">{badge.icon}</div>
          <h3 className="font-semibold mb-2">{badge.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
          <p className="text-xs text-gray-500">
            Earned on {new Date(badge.earnedAt).toLocaleDateString()}
          </p>
        </motion.div>
      ))}
      
      {user.badges.length === 0 && (
        <div className="col-span-full text-center py-8">
          <div className="text-4xl mb-4">🏅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No badges yet</h3>
          <p className="text-gray-600">Participate in contests to earn badges!</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-center space-x-6">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
            alt={user.username}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button className="btn-outline">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">{user.totalContests}</div>
          <div className="text-sm text-gray-600">Total Contests</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">₹{user.totalWinnings.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Winnings</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{user.winRate}%</div>
          <div className="text-sm text-gray-600">Win Rate</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">{user.badges.length}</div>
          <div className="text-sm text-gray-600">Badges Earned</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex space-x-4 border-b border-gray-200 mb-6">
          {[
            { key: 'teams', label: 'My Teams' },
            { key: 'stats', label: 'Statistics' },
            { key: 'badges', label: 'Badges' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-2 px-1 font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'teams' && renderTeamsTab()}
        {activeTab === 'stats' && renderStatsTab()}
        {activeTab === 'badges' && renderBadgesTab()}
      </div>
    </div>
  );
};

export default ProfilePage;