import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '../../types';
import { getPlayerPositionColor } from '../../utils';

interface PlayerCardProps {
  player: Player;
  isSelected?: boolean;
  canSelect?: boolean;
  onSelect?: (player: Player) => void;
  onRemove?: (playerId: string) => void;
  showStats?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isSelected = false,
  canSelect = true,
  onSelect,
  onRemove,
  showStats = true
}) => {
  const handleClick = () => {
    if (isSelected && onRemove) {
      onRemove(player.id);
    } else if (canSelect && onSelect) {
      onSelect(player);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: canSelect ? 1.02 : 1 }}
      whileTap={{ scale: canSelect ? 0.98 : 1 }}
      className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-primary-500 bg-primary-50 shadow-md'
          : canSelect
          ? 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
          : 'border-gray-200 opacity-50 cursor-not-allowed'
      }`}
      onClick={handleClick}
    >
      {/* Player Info */}
      <div className="flex items-center space-x-3 mb-3">
        <img
          src={player.avatar || 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=150'}
          alt={player.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{player.name}</h3>
          <p className="text-sm text-gray-600">{player.team}</p>
        </div>
        <div className="text-right">
          <div className="font-bold text-primary-600">{player.credits}</div>
          <div className="text-xs text-gray-500">Credits</div>
        </div>
      </div>

      {/* Position Badge */}
      <div className="absolute top-2 right-2">
        <span className={`px-2 py-1 rounded text-xs font-medium ${getPlayerPositionColor(player.position)}`}>
          {player.position}
        </span>
      </div>

      {showStats && (
        <>
          {/* Stats */}
          <div className="flex items-center justify-between text-sm mb-3">
            <div className="flex items-center space-x-3">
              <span className="text-green-600">⚽ {player.stats.goals}</span>
              <span className="text-blue-600">🎯 {player.stats.assists}</span>
              {player.position === 'GK' && (
                <span className="text-purple-600">🥅 {player.stats.cleanSheets}</span>
              )}
            </div>
            <div className="font-semibold text-gray-900">{player.points} pts</div>
          </div>

          {/* Form */}
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">Form:</span>
            {player.recentForm.slice(-5).map((form, index) => (
              <div
                key={index}
                className={`w-5 h-5 rounded text-xs flex items-center justify-center text-white font-medium ${
                  form >= 8 ? 'bg-green-500' : form >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              >
                {form}
              </div>
            ))}
          </div>

          {/* Playing Status */}
          <div className="mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              player.isPlaying
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-1 ${
                player.isPlaying ? 'bg-green-400' : 'bg-red-400'
              }`} />
              {player.isPlaying ? 'Playing' : 'Not Playing'}
            </span>
          </div>
        </>
      )}

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-primary-500 rounded-lg pointer-events-none">
          <div className="absolute top-2 left-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">✓</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PlayerCard;