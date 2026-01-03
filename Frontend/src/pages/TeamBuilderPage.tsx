import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Player, PlayerPosition, SelectedPlayer } from '../types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL;

const TeamBuilderPage: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
  const { user, updateUserRank } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);
  const [captain, setCaptain] = useState<string>('');
  const [viceCaptain, setViceCaptain] = useState<string>('');
  const [teamName, setTeamName] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<PlayerPosition>('GK');
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  const maxCredits = user?.balance || 100;
  const maxPlayersPerTeam = 11;
  const positionRequirements = {
    GK: { min: 1, max: 1 },
    DEF: { min: 3, max: 5 },
    MID: { min: 3, max: 5 },
    FWD: { min: 1, max: 3 }
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/api/players?userRankPoints=${user.rankPoints || 0}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch players');
        }
        
        const data = await response.json();
        
        // Transform backend data to frontend format
        const formattedPlayers = data.map((player: any) => ({
          id: player._id,
          name: player.name,
          position: player.position,
          team: player.team,
          country: player.country,
          credits: player.credits,
          points: player.points,
          isPlaying: player.isPlaying,
          recentForm: player.recentForm || [],
          avatar: player.avatar || `https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=150&sig=${player.name}`,
          stats: player.stats || {
            goals: 0,
            assists: 0,
            cleanSheets: 0,
            saves: 0,
            yellowCards: 0,
            redCards: 0,
            matchesPlayed: 0
          },
          globalRanking: player.globalRanking
        }));
        
        setPlayers(formattedPlayers);
      } catch (error) {
        console.error('Error fetching players:', error);
        toast.error('Failed to load players');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [user]);

  useEffect(() => {
    const total = selectedPlayers.reduce((sum, sp) => sum + sp.player.credits, 0);
    setCreditsUsed(total);
  }, [selectedPlayers]);

  const getPositionCount = (position: PlayerPosition) => {
    return selectedPlayers.filter(sp => sp.player.position === position).length;
  };

  const canAddPlayer = (player: Player) => {
    if (selectedPlayers.length >= maxPlayersPerTeam) return false;
    if (selectedPlayers.find(sp => sp.playerId === player.id)) return false;
    if (creditsUsed + player.credits > maxCredits) return false;
    
    const positionCount = getPositionCount(player.position);
    const requirement = positionRequirements[player.position];
    return positionCount < requirement.max;
  };

  const addPlayer = (player: Player) => {
    if (!canAddPlayer(player)) {
      toast.error('Cannot add this player');
      return;
    }

    const selectedPlayer: SelectedPlayer = {
      playerId: player.id,
      player,
      isCaptain: false,
      isViceCaptain: false,
      points: player.points,
      multiplier: 1
    };

    setSelectedPlayers(prev => [...prev, selectedPlayer]);
    toast.success(`${player.name} added to team`);
  };

  const removePlayer = (playerId: string) => {
    setSelectedPlayers(prev => prev.filter(sp => sp.playerId !== playerId));
    
    if (captain === playerId) setCaptain('');
    if (viceCaptain === playerId) setViceCaptain('');
  };

  const isTeamValid = () => {
    if (selectedPlayers.length !== maxPlayersPerTeam) return false;
    if (!captain || !viceCaptain) return false;
    if (captain === viceCaptain) return false;
    if (!teamName.trim()) return false;
    if (creditsUsed > maxCredits) return false;
    
    for (const [position, requirement] of Object.entries(positionRequirements)) {
      const count = getPositionCount(position as PlayerPosition);
      if (count < requirement.min || count > requirement.max) return false;
    }
    
    return true;
  };

  const saveTeam = async () => {
    // Check specific validation errors and show detailed messages
    if (!isTeamValid()) {
      if (selectedPlayers.length !== maxPlayersPerTeam) {
        toast.error(`Please select exactly ${maxPlayersPerTeam} players. Currently selected: ${selectedPlayers.length}`);
        return;
      }
      if (!captain) {
        toast.error('Please select a captain');
        return;
      }
      if (!viceCaptain) {
        toast.error('Please select a vice captain');
        return;
      }
      if (captain === viceCaptain) {
        toast.error('Captain and Vice Captain must be different players');
        return;
      }
      if (!teamName.trim()) {
        toast.error('Please enter a team name');
        return;
      }
      if (creditsUsed > maxCredits) {
        toast.error(`You have exceeded the credit limit. Used: ${creditsUsed}, Available: ${maxCredits}`);
        return;
      }
      
      // Check position requirements
      for (const [position, requirement] of Object.entries(positionRequirements)) {
        const count = getPositionCount(position as PlayerPosition);
        if (count < requirement.min) {
          toast.error(`You need at least ${requirement.min} ${position} players. Currently have: ${count}`);
          return;
        }
        if (count > requirement.max) {
          toast.error(`You can have maximum ${requirement.max} ${position} players. Currently have: ${count}`);
          return;
        }
      }
      
      toast.error('Please complete your team selection');
      return;
    }

    try {
      setLoading(true);
      
      const token = localStorage.getItem('play11_token');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      // Prepare team data
      const captainPlayer = selectedPlayers.find(sp => sp.playerId === captain);
      const viceCaptainPlayer = selectedPlayers.find(sp => sp.playerId === viceCaptain);
      
      if (!captainPlayer || !viceCaptainPlayer) {
        toast.error('Captain or Vice Captain not found in selected players');
        return;
      }
      
      const teamData = {
        name: teamName.trim(),
        contestId: contestId || 'default-contest',
        matchId: 'match-1',
        matchName: 'Premier League Match',
        matchDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        players: selectedPlayers.map(sp => ({
          playerId: sp.player.id,
          name: sp.player.name,
          position: sp.player.position,
          team: sp.player.team,
          credits: sp.player.credits,
          points: sp.player.points || 0,
          multiplier: sp.playerId === captain ? 2 : sp.playerId === viceCaptain ? 1.5 : 1
        })),
        captain: {
          playerId: captain,
          name: captainPlayer.player.name,
          position: captainPlayer.player.position
        },
        viceCaptain: {
          playerId: viceCaptain,
          name: viceCaptainPlayer.player.name,
          position: viceCaptainPlayer.player.position
        },
        totalCreditsUsed: creditsUsed
      };

      console.log('Sending team data:', teamData);

      const response = await fetch(`${API_URL}/api/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(teamData)
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      if (response.ok) {
        const result = JSON.parse(responseText);
        toast.success(result.message || 'Team saved successfully!');
        
        // Update user rank for participating in contest
        await updateUserRank(true, false, 0);
        
        navigate('/dashboard/my-teams');
      } else {
        let errorMessage = 'Failed to save team';
        try {
          const error = JSON.parse(responseText);
          errorMessage = error.msg || error.message || error.error || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        
        console.error('Error response:', errorMessage);
        toast.error(`Error: ${errorMessage}`);
        
        // Handle authentication errors specifically
        if (response.status === 401) {
          toast.error('Authentication failed. Please refresh the page.');
          localStorage.removeItem('play11_token');
          setTimeout(() => window.location.reload(), 2000);
        }
      }
    } catch (error) {
      console.error('Network error saving team:', error);
      toast.error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(player => player.position === selectedPosition);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Your Team</h1>
          <div className="flex items-center space-x-4 mt-2">
            <div className="text-sm text-gray-600">
              Global Rank: <span className="font-semibold text-primary-600">#{user?.globalRank || 'N/A'}</span>
            </div>
            <div className="text-sm text-gray-600">
              Rank Points: <span className="font-semibold text-green-600">{user?.rankPoints || 0}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Credits Available</div>
          <div className={`text-2xl font-bold ${
            creditsUsed > maxCredits ? 'text-red-600' : 'text-primary-600'
          }`}>
            {(maxCredits - creditsUsed).toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">Max: {maxCredits}</div>
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Team Name
        </label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter your team name..."
          className="input-field"
          maxLength={20}
        />
      </div>

      <div className="card">
        <div className="flex space-x-4 mb-6">
          {Object.keys(positionRequirements).map((position) => {
            const pos = position as PlayerPosition;
            const count = getPositionCount(pos);
            const requirement = positionRequirements[pos];
            const isActive = selectedPosition === pos;
            
            return (
              <button
                key={position}
                onClick={() => setSelectedPosition(pos)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {position} ({count}/{requirement.min}-{requirement.max})
              </button>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => {
            const isSelected = selectedPlayers.find(sp => sp.playerId === player.id);
            const canAdd = canAddPlayer(player);
            
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : canAdd
                    ? 'border-gray-200 hover:border-primary-300'
                    : 'border-gray-200 opacity-50 cursor-not-allowed'
                }`}
                onClick={() => {
                  if (isSelected) {
                    removePlayer(player.id);
                  } else if (canAdd) {
                    addPlayer(player);
                  }
                }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-sm text-gray-600">{player.team}</div>
                    <div className="text-xs text-purple-600">
                      Global Rank: #{player.globalRanking}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary-600">{player.credits}</div>
                    <div className="text-xs text-gray-500">Credits</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">⚽ {player.stats.goals}</span>
                    <span className="text-blue-600">🎯 {player.stats.assists}</span>
                  </div>
                  <div className="font-semibold">{player.points} pts</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold mb-4">Your Team ({selectedPlayers.length}/11)</h3>
        
        {selectedPlayers.length > 0 ? (
          <div className="space-y-4">
            {/* Captain and Vice Captain Selection */}
            {selectedPlayers.length >= 1 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Select Captain & Vice Captain</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Captain (2x points)
                    </label>
                    <select
                      value={captain}
                      onChange={(e) => setCaptain(e.target.value)}
                      className="input-field w-full"
                    >
                      <option value="">Select Captain</option>
                      {selectedPlayers.map((sp) => (
                        <option key={sp.playerId} value={sp.playerId}>
                          {sp.player.name} ({sp.player.position})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vice Captain (1.5x points)
                    </label>
                    <select
                      value={viceCaptain}
                      onChange={(e) => setViceCaptain(e.target.value)}
                      className="input-field w-full"
                    >
                      <option value="">Select Vice Captain</option>
                      {selectedPlayers
                        .filter((sp) => sp.playerId !== captain)
                        .map((sp) => (
                          <option key={sp.playerId} value={sp.playerId}>
                            {sp.player.name} ({sp.player.position})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {selectedPlayers.map((selectedPlayer) => {
                const isCaptain = captain === selectedPlayer.playerId;
                const isViceCaptain = viceCaptain === selectedPlayer.playerId;
                
                return (
                  <div
                    key={selectedPlayer.playerId}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isCaptain ? 'bg-yellow-50 border border-yellow-200' :
                      isViceCaptain ? 'bg-blue-50 border border-blue-200' :
                      'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={selectedPlayer.player.avatar}
                        alt={selectedPlayer.player.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium flex items-center space-x-2">
                          <span>{selectedPlayer.player.name}</span>
                          {isCaptain && <span className="text-yellow-600 text-xs font-bold">(C)</span>}
                          {isViceCaptain && <span className="text-blue-600 text-xs font-bold">(VC)</span>}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedPlayer.player.position} - {selectedPlayer.player.team}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="font-bold">{selectedPlayer.player.credits}</div>
                        <div className="text-xs text-gray-500">Credits</div>
                      </div>
                      
                      <button
                        onClick={() => removePlayer(selectedPlayer.playerId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Start selecting players to build your team
          </div>
        )}
        
        <button
          onClick={saveTeam}
          disabled={!isTeamValid()}
          className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold transition-colors ${
            isTeamValid()
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Save Team & Join Contest
        </button>
      </div>
    </div>
  );
};

export default TeamBuilderPage;