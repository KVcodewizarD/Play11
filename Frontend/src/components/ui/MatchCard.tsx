import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Match } from '../../types';
import { calculateTimeRemaining, formatCurrency } from '../../utils';

interface MatchCardProps {
  match: Match;
  showActions?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, showActions = true }) => {
  const getStatusBadge = () => {
    const statusConfig = {
      upcoming: { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' },
      live: { label: 'Live', color: 'bg-red-100 text-red-800' },
      completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Cancelled', color: 'bg-yellow-100 text-yellow-800' }
    };

    const config = statusConfig[match.status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
        {match.status === 'live' && <span className="ml-1 animate-pulse">🔴</span>}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card card-hover"
    >
      {/* Match Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          {getStatusBadge()}
          {match.lineupAnnounced && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              Lineup Announced
            </span>
          )}
        </div>
        <div className="text-right text-sm text-gray-600">
          <div>{match.venue}</div>
          {match.weather && <div className="text-xs">{match.weather}</div>}
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-6">
        {/* Home Team */}
        <div className="text-center flex-1">
          <div className="text-4xl mb-2">{match.homeTeam.logo}</div>
          <div className="font-semibold text-sm">{match.homeTeam.name}</div>
        </div>

        {/* Match Info */}
        <div className="text-center mx-8">
          <div className="text-3xl font-bold mb-2 text-gray-400">VS</div>
          <div className="text-sm text-gray-600 mb-1">
            {new Date(match.startTime).toLocaleDateString()}
          </div>
          <div className="font-medium">
            {new Date(match.startTime).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
          {match.status === 'upcoming' && (
            <div className="text-xs text-primary-600 font-medium mt-1">
              {calculateTimeRemaining(match.startTime)}
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="text-center flex-1">
          <div className="text-4xl mb-2">{match.awayTeam.logo}</div>
          <div className="font-semibold text-sm">{match.awayTeam.name}</div>
        </div>
      </div>

      {/* Contest Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>{match.totalContests} Contests Available</span>
        <span>{formatCurrency(match.totalPrizePool)} Total Prize Pool</span>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex space-x-3">
          <Link
            to={`/matches/${match.id}/contests`}
            className="flex-1 btn-primary text-center"
          >
            View Contests
          </Link>
          <Link
            to={`/create-contest/${match.id}`}
            className="flex-1 btn-outline text-center"
          >
            Create Contest
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default MatchCard;