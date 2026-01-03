import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Transaction } from '../types';

const HistoryPage: React.FC = () => {
  const { user, getTransactionHistory } = useAuth();
  const [activeTab, setActiveTab] = useState<'contests' | 'transactions'>('contests');
  const transactions = getTransactionHistory();

  // Mock contest history
  const contestHistory = [
    {
      id: 'history-1',
      contestName: 'Premier League Mega Contest',
      matchName: 'Manchester United vs Liverpool',
      date: '2024-03-10',
      entryFee: 25,
      rank: 1245,
      totalParticipants: 10000,
      points: 185,
      winnings: 0,
      status: 'completed'
    },
    {
      id: 'history-2',
      contestName: 'Head to Head Challenge',
      matchName: 'Chelsea vs Arsenal',
      date: '2024-03-08',
      entryFee: 100,
      rank: 1,
      totalParticipants: 2,
      points: 234,
      winnings: 180,
      status: 'completed'
    },
    {
      id: 'history-3',
      contestName: 'Champions League Special',
      matchName: 'Real Madrid vs Barcelona',
      date: '2024-03-05',
      entryFee: 50,
      rank: 45,
      totalParticipants: 500,
      points: 198,
      winnings: 250,
      status: 'completed'
    }
  ];

  const getTransactionIcon = (type: string) => {
    const icons = {
      deposit: '💰',
      withdrawal: '🏦',
      contest_entry: '🎯',
      winnings: '🏆',
      refund: '↩️'
    };
    return icons[type as keyof typeof icons] || '💰';
  };

  const getTransactionColor = (type: string) => {
    const colors = {
      deposit: 'text-green-600',
      withdrawal: 'text-blue-600',
      contest_entry: 'text-red-600',
      winnings: 'text-green-600',
      refund: 'text-yellow-600'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600';
  };

  const renderContestsTab = () => (
    <div className="space-y-4">
      {contestHistory.map((contest, index) => (
        <motion.div
          key={contest.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{contest.contestName}</h3>
              <p className="text-sm text-gray-600">{contest.matchName}</p>
              <p className="text-xs text-gray-500">{new Date(contest.date).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${contest.winnings > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {contest.winnings > 0 ? `+₹${contest.winnings}` : 'No Winnings'}
              </div>
              <div className="text-xs text-gray-500">
                Rank {contest.rank} of {contest.totalParticipants}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="font-semibold">₹{contest.entryFee}</div>
              <div className="text-xs text-gray-500">Entry Fee</div>
            </div>
            <div>
              <div className="font-semibold">{contest.points}</div>
              <div className="text-xs text-gray-500">Points Scored</div>
            </div>
            <div>
              <div className="font-semibold">{contest.rank}</div>
              <div className="text-xs text-gray-500">Final Rank</div>
            </div>
            <div>
              <div className={`font-semibold ${contest.winnings > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                ₹{contest.winnings}
              </div>
              <div className="text-xs text-gray-500">Winnings</div>
            </div>
          </div>
        </motion.div>
      ))}
      
      {contestHistory.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No contest history</h3>
          <p className="text-gray-600">Your contest history will appear here once you participate.</p>
        </div>
      )}
    </div>
  );

  const renderTransactionsTab = () => (
    <div className="space-y-3">
      {transactions.map((transaction, index) => (
        <motion.div
          key={transaction.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
        >
          <div className="flex items-center space-x-4">
            <div className="text-3xl">{getTransactionIcon(transaction.type)}</div>
            <div>
              <div className="font-medium">{transaction.description}</div>
              <div className="text-sm text-gray-600">
                {new Date(transaction.createdAt).toLocaleDateString()} at{' '}
                {new Date(transaction.createdAt).toLocaleTimeString()}
              </div>
              <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold ${getTransactionColor(transaction.type)}`}>
              {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount)}
            </div>
          </div>
        </motion.div>
      ))}
      
      {transactions.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💳</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
          <p className="text-gray-600">Your transaction history will appear here.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">History</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Total Winnings:</span>
          <span className="font-bold text-green-600">₹{user?.totalWinnings.toLocaleString()}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">{user?.totalContests}</div>
          <div className="text-sm text-gray-600">Total Contests</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">₹{user?.totalWinnings.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Winnings</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{user?.winRate}%</div>
          <div className="text-sm text-gray-600">Win Rate</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex space-x-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('contests')}
            className={`pb-2 px-1 font-medium transition-colors ${
              activeTab === 'contests'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Contest History
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-2 px-1 font-medium transition-colors ${
              activeTab === 'transactions'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Transactions
          </button>
        </div>

        {activeTab === 'contests' && renderContestsTab()}
        {activeTab === 'transactions' && renderTransactionsTab()}
      </div>
    </div>
  );
};

export default HistoryPage;