import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Match, MatchFilters, MatchStatus } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filters, setFilters] = useState<MatchFilters>({
    status: ['upcoming', 'live'],
    teams: [],
    dateRange: {
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    sortBy: 'date',
    sortOrder: 'asc'
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');

  const statusOptions = [
    { 
      id: 'upcoming', 
      label: 'Upcoming', 
      icon: '⏰', 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700',
      count: 0
    },
    { 
      id: 'live', 
      label: 'Live Now', 
      icon: '🔴', 
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 border-red-200',
      textColor: 'text-red-700',
      count: 0
    },
    { 
      id: 'completed', 
      label: 'Completed', 
      icon: '✅', 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 border-green-200',
      textColor: 'text-green-700',
      count: 0
    },
    { 
      id: 'cancelled', 
      label: 'Cancelled', 
      icon: '❌', 
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50 border-gray-200',
      textColor: 'text-gray-700',
      count: 0
    }
  ];

  const leagues = [
    { id: 'all', name: 'All Leagues', icon: '🏆' },
    { id: 'Premier League', name: 'Premier League', icon: '👑' },
    { id: 'Champions League', name: 'Champions League', icon: '⭐' },
    { id: 'La Liga', name: 'La Liga', icon: '🇪🇸' },
    { id: 'Serie A', name: 'Serie A', icon: '🇮🇹' },
    { id: 'Bundesliga', name: 'Bundesliga', icon: '🇩🇪' },
    { id: 'FA Cup', name: 'FA Cup', icon: '🏆' },
    { id: 'Europa League', name: 'Europa League', icon: '🏆' }
  ];

  // Enhanced team logo mapping with more teams
  const getTeamLogo = (teamName: string): string => {
    const logoMap: { [key: string]: string } = {
      // Premier League
      'Manchester United': '🔴',
      'Liverpool': '❤️',
      'Chelsea': '🔵',
      'Arsenal': '🔫',
      'Manchester City': '💙',
      'Tottenham': '⚪',
      'Newcastle United': '⚫',
      'Brighton': '🔵',
      'Aston Villa': '🟣',
      'West Ham': '⚒️',
      'Leicester City': '🦊',
      'Everton': '🔵',
      'Crystal Palace': '🦅',
      'Burnley': '🟤',
      
      // La Liga
      'Real Madrid': '👑',
      'Barcelona': '🔴',
      'Atletico Madrid': '🔴',
      'Sevilla': '�',
      'Valencia': '🦇',
      'Real Sociedad': '�',
      
      // Serie A
      'AC Milan': '🔴',
      'Inter Milan': '🔵',
      'Juventus': '⚫',
      'AS Roma': '🟡',
      'Napoli': '🔵',
      'Atalanta': '⚫',
      'Lazio': '🔵',
      
      // Bundesliga
      'Bayern Munich': '🔴',
      'Borussia Dortmund': '💛',
      'RB Leipzig': '🔴',
      'Bayer Leverkusen': '🔴',
      'Eintracht Frankfurt': '🦅',
      'VfB Stuttgart': '🔴',
      
      // Champions League / Europa League
      'PSG': '💜',
      'Ajax': '�',
      'Villarreal': '�💛',
      'FC Porto': '🔵',
      'Benfica': '🔴'
    };
    return logoMap[teamName] || '⚽';
  };

  const getVenue = (homeTeam: string): string => {
    const venueMap: { [key: string]: string } = {
      // Premier League Venues
      'Manchester United': 'Old Trafford',
      'Liverpool': 'Anfield',
      'Chelsea': 'Stamford Bridge',
      'Arsenal': 'Emirates Stadium',
      'Manchester City': 'Etihad Stadium',
      'Tottenham': 'Tottenham Hotspur Stadium',
      'Newcastle United': 'St. James Park',
      'Brighton': 'American Express Stadium',
      'Aston Villa': 'Villa Park',
      'West Ham': 'London Stadium',
      'Leicester City': 'King Power Stadium',
      'Everton': 'Goodison Park',
      'Crystal Palace': 'Selhurst Park',
      
      // La Liga Venues
      'Real Madrid': 'Santiago Bernabéu',
      'Barcelona': 'Camp Nou',
      'Atletico Madrid': 'Wanda Metropolitano',
      'Sevilla': 'Ramón Sánchez Pizjuán',
      'Valencia': 'Mestalla',
      'Real Sociedad': 'Anoeta Stadium',
      
      // Serie A Venues
      'AC Milan': 'San Siro',
      'Inter Milan': 'San Siro',
      'Juventus': 'Allianz Stadium',
      'AS Roma': 'Stadio Olimpico',
      'Napoli': 'Stadio Diego Armando Maradona',
      'Atalanta': 'Gewiss Stadium',
      'Lazio': 'Stadio Olimpico',
      
      // Bundesliga Venues
      'Bayern Munich': 'Allianz Arena',
      'Borussia Dortmund': 'Signal Iduna Park',
      'RB Leipzig': 'Red Bull Arena',
      'Bayer Leverkusen': 'BayArena',
      'Eintracht Frankfurt': 'Deutsche Bank Park',
      'VfB Stuttgart': 'Mercedes-Benz Arena',
      
      // Other venues
      'PSG': 'Parc des Princes',
      'Ajax': 'Johan Cruyff Arena',
      'Villarreal': 'Estadio de la Cerámica',
      'FC Porto': 'Estádio do Dragão',
      'Benfica': 'Estádio da Luz'
    };
    return venueMap[homeTeam] || 'Football Stadium';
  };

  const getLeagueIcon = (league: string): string => {
    const leagueIcons: { [key: string]: string } = {
      'Premier League': '👑',
      'Champions League': '⭐',
      'La Liga': '🇪🇸',
      'Serie A': '🇮🇹',
      'Bundesliga': '🇩🇪',
      'FA Cup': '🏆',
      'Europa League': '🏆'
    };
    return leagueIcons[league] || '⚽';
  };

  // Mock data for development
  // const mockMatches: Match[] = [
  //   {
  //     id: '1',
  //     homeTeam: {
  //       id: '1',
  //       name: 'Manchester United',
  //       country: 'England',
  //       logo: '🔴',
  //       players: []
  //     },
  //     awayTeam: {
  //       id: '2',
  //       name: 'Liverpool',
  //       country: 'England',
  //       logo: '🔴',
  //       players: []
  //     },
  //     startTime: '2024-03-15T15:00:00Z',
  //     status: 'upcoming',
  //     venue: 'Old Trafford',
  //     weather: 'Clear, 18°C',
  //     totalContests: 24,
  //     totalPrizePool: 50000,
  //     lineupAnnounced: true
  //   },
  //   {
  //     id: '2',
  //     homeTeam: {
  //       id: '3',
  //       name: 'Chelsea',
  //       country: 'England',
  //       logo: '🔵',
  //       players: []
  //     },
  //     awayTeam: {
  //       id: '4',
  //       name: 'Arsenal',
  //       country: 'England',
  //       logo: '🔴',
  //       players: []
  //     },
  //     startTime: '2024-03-15T17:30:00Z',
  //     status: 'upcoming',
  //     venue: 'Stamford Bridge',
  //     weather: 'Cloudy, 16°C',
  //     totalContests: 18,
  //     totalPrizePool: 35000,
  //     lineupAnnounced: false
  //   },
  //   {
  //     id: '3',
  //     homeTeam: {
  //       id: '5',
  //       name: 'Manchester City',
  //       country: 'England',
  //       logo: '🔵',
  //       players: []
  //     },
  //     awayTeam: {
  //       id: '6',
  //       name: 'Tottenham',
  //       country: 'England',
  //       logo: '⚪',
  //       players: []
  //     },
  //     startTime: '2024-03-16T14:00:00Z',
  //     status: 'live',
  //     venue: 'Etihad Stadium',
  //     weather: 'Rainy, 14°C',
  //     totalContests: 32,
  //     totalPrizePool: 75000,
  //     lineupAnnounced: true
  //   }
  // ];

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams();
        
        // Add status filters
        if (filters.status.length > 0) {
          filters.status.forEach(status => {
            params.append('status', status.toUpperCase());
          });
        }
        
        // Add league filter
        if (selectedLeague !== 'all') {
          params.append('league', selectedLeague);
        }
        
        // Add sorting
        params.append('sortBy', filters.sortBy === 'date' ? 'matchStartTime' : filters.sortBy);
        params.append('sortOrder', filters.sortOrder);
        params.append('limit', '100');
        
        const response = await fetch(`${API_URL}/api/matches?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch matches');
        }
        const data = await response.json();
        
        // Transform backend data to match frontend expectations
        const formattedMatches = data.map((match: any) => {
          // Safely extract team names from the backend structure
          const homeTeamName = match.teams?.[0]?.name || 'Home Team';
          const awayTeamName = match.teams?.[1]?.name || 'Away Team';
          
          // Map backend status to frontend status
          const statusMapping: { [key: string]: MatchStatus } = {
            'UPCOMING': 'upcoming',
            'LIVE': 'live', 
            'COMPLETED': 'completed',
            'CANCELLED': 'cancelled'
          };
          
          return {
            id: match._id,
            homeTeam: {
              id: `home_${match._id}`,
              name: homeTeamName,
              country: match.teams?.[0]?.league || 'Unknown',
              logo: getTeamLogo(homeTeamName),
              players: []
            },
            awayTeam: {
              id: `away_${match._id}`, 
              name: awayTeamName,
              country: match.teams?.[1]?.league || 'Unknown',
              logo: getTeamLogo(awayTeamName),
              players: []
            },
            startTime: match.matchStartTime || new Date().toISOString(),
            status: statusMapping[match.status] || 'upcoming',
            venue: match.venue || getVenue(homeTeamName),
            weather: match.weather || 'Clear, 20°C',
            totalContests: match.totalContests || Math.floor(Math.random() * 50) + 5,
            totalPrizePool: match.totalPrizePool || Math.floor(Math.random() * 100000) + 10000,
            lineupAnnounced: match.lineupAnnounced !== undefined ? match.lineupAnnounced : Math.random() > 0.5,
            // Additional fields for better display
            league: match.league,
            leagueIcon: getLeagueIcon(match.league),
            score: match.score
          };
        }).filter((match: Match) => match.homeTeam.name !== 'Home Team' && match.awayTeam.name !== 'Away Team');
        
        console.log(`✅ Fetched ${formattedMatches.length} matches from backend`);
        setMatches(formattedMatches);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [filters, selectedLeague]);

  const getStatusBadge = (status: MatchStatus) => {
    const statusConfig = {
      upcoming: { 
        label: 'Upcoming', 
        color: 'bg-gradient-to-r from-blue-500 to-blue-600',
        textColor: 'text-white',
        icon: '⏰',
        pulse: false
      },
      live: { 
        label: 'Live', 
        color: 'bg-gradient-to-r from-red-500 to-red-600',
        textColor: 'text-white',
        icon: '🔴',
        pulse: true
      },
      completed: { 
        label: 'Completed', 
        color: 'bg-gradient-to-r from-green-500 to-green-600',
        textColor: 'text-white',
        icon: '✅',
        pulse: false
      },
      cancelled: { 
        label: 'Cancelled', 
        color: 'bg-gradient-to-r from-gray-500 to-gray-600',
        textColor: 'text-white',
        icon: '❌',
        pulse: false
      }
    };

    const config = statusConfig[status] || statusConfig.upcoming;
    
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-semibold ${config.color} ${config.textColor} shadow-lg`}>
        <span className={config.pulse ? 'animate-pulse' : ''}>{config.icon}</span>
        <span>{config.label}</span>
        {status === 'live' && (
          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
        )}
      </div>
    );
  };

  const getMatchIntensity = (match: Match) => {
    const intensity = (match.totalContests + match.totalPrizePool / 1000) / 100;
    if (intensity > 0.8) return { label: 'High', color: 'text-red-600', icon: '🔥' };
    if (intensity > 0.5) return { label: 'Medium', color: 'text-yellow-600', icon: '⚡' };
    return { label: 'Low', color: 'text-green-600', icon: '🌱' };
  };

  const getTimeUntilMatch = (startTime: string) => {
    const now = new Date();
    const matchTime = new Date(startTime);
    const diff = matchTime.getTime() - now.getTime();
    
    if (diff < 0) return { text: 'Started', urgent: false };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return { text: `${days}d ${hours % 24}h`, urgent: false };
    }
    
    if (hours < 2) {
      return { text: `${hours}h ${minutes}m`, urgent: true };
    }
    
    return { text: `${hours}h ${minutes}m`, urgent: false };
  };

  const filteredMatches = matches.filter(match => {
    const statusMatch = filters.status.includes(match.status);
    const leagueMatch = selectedLeague === 'all' || 
      (match as any).league === selectedLeague ||
      match.venue?.toLowerCase().includes(selectedLeague.toLowerCase());
    return statusMatch && leagueMatch;
  });

  // Update status counts
  const updatedStatusOptions = statusOptions.map(option => ({
    ...option,
    count: matches.filter(match => match.status === option.id).length
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Header with Gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-blue-600 to-green-600 rounded-3xl opacity-10"></div>
        <div className="relative p-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              ⚽ Football Matches
            </h1>
            <p className="text-gray-600 text-lg">Discover and join exciting football contests</p>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Status Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {updatedStatusOptions.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => {
              const isSelected = filters.status.includes(option.id as MatchStatus);
              if (isSelected) {
                setFilters(prev => ({
                  ...prev,
                  status: prev.status.filter(s => s !== option.id)
                }));
              } else {
                setFilters(prev => ({
                  ...prev,
                  status: [...prev.status, option.id as MatchStatus]
                }));
              }
            }}
            className={`cursor-pointer transition-all duration-300 rounded-2xl border-2 p-4 hover:shadow-lg hover:scale-105 ${
              filters.status.includes(option.id as MatchStatus)
                ? `${option.bgColor} border-current shadow-lg scale-105`
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center space-y-2">
              <div className="text-2xl">{option.icon}</div>
              <div className={`font-semibold ${filters.status.includes(option.id as MatchStatus) ? option.textColor : 'text-gray-700'}`}>
                {option.label}
              </div>
              <div className={`text-2xl font-bold ${filters.status.includes(option.id as MatchStatus) ? option.textColor : 'text-gray-900'}`}>
                {option.count}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Advanced Filters Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm"
      >
        <div className="p-6">
          <div className="flex flex-wrap gap-6 items-center justify-between">
            {/* League Filter */}
            <div className="flex items-center space-x-4">
              <span className="font-semibold text-gray-700">League:</span>
              <div className="flex flex-wrap gap-2">
                {leagues.map((league) => (
                  <button
                    key={league.id}
                    onClick={() => setSelectedLeague(league.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      selectedLeague === league.id
                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    <span>{league.icon}</span>
                    <span className="text-sm font-medium">{league.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode & Sort */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <select 
                className="bg-white border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              >
                <option value="date">📅 Sort by Date</option>
                <option value="popularity">🔥 Sort by Popularity</option>
                <option value="prize_pool">💰 Sort by Prize Pool</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modern Matches Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={viewMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={viewMode === 'grid' ? 'grid gap-6' : 'space-y-4'}
        >
          {filteredMatches.map((match, index) => {
            const timeInfo = getTimeUntilMatch(match.startTime);
            const intensityInfo = getMatchIntensity(match);
            
            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                  viewMode === 'list' ? 'p-4' : 'p-6'
                }`}
              >
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-green-50 opacity-50"></div>
                
                {/* Content */}
                <div className="relative">
                  {/* Header Section */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(match.status)}
                      
                      {match.lineupAnnounced && (
                        <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          <span>✅</span>
                          <span>Lineup Out</span>
                        </div>
                      )}
                      
                      <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${intensityInfo.color} bg-opacity-10`}>
                        <span>{intensityInfo.icon}</span>
                        <span>{intensityInfo.label} Interest</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                        <span>🏟️</span>
                        <span>{match.venue}</span>
                      </div>
                      {match.weather && (
                        <div className="text-xs text-gray-500 mt-1">{match.weather}</div>
                      )}
                      {(match as any).league && (
                        <div className="text-xs text-primary-600 mt-1 flex items-center space-x-1">
                          <span>{(match as any).leagueIcon}</span>
                          <span>{(match as any).league}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main Match Display */}
                  <div className="flex items-center justify-between mb-8">
                    {/* Home Team */}
                    <motion.div 
                      className="text-center flex-1"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-5xl mb-3 transition-transform group-hover:scale-110">
                        {match.homeTeam.logo}
                      </div>
                      <div className="font-bold text-lg text-gray-800">{match.homeTeam.name}</div>
                      <div className="text-sm text-gray-500">{match.homeTeam.country}</div>
                    </motion.div>

                    {/* Match Center Info */}
                    <div className="text-center mx-8 px-6 py-4 bg-white rounded-2xl shadow-md border border-gray-100">
                      {/* Show score for live and completed matches */}
                      {(match.status === 'live' || match.status === 'completed') && (match as any).score ? (
                        <div className="text-center">
                          <div className="text-6xl font-black mb-2 bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                            {(match as any).score.home} - {(match as any).score.away}
                          </div>
                          <div className="text-sm font-semibold text-gray-600">
                            {match.status === 'live' ? '⚡ LIVE' : '✅ FINAL'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-4xl font-black mb-3 bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                          VS
                        </div>
                      )}
                      <div className="space-y-2 mt-3">
                        <div className="text-sm font-semibold text-gray-700">
                          {new Date(match.startTime).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {new Date(match.startTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        {match.status === 'upcoming' && (
                          <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                            timeInfo.urgent 
                              ? 'bg-red-100 text-red-700 animate-pulse' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            ⏰ {timeInfo.text}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Away Team */}
                    <motion.div 
                      className="text-center flex-1"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-5xl mb-3 transition-transform group-hover:scale-110">
                        {match.awayTeam.logo}
                      </div>
                      <div className="font-bold text-lg text-gray-800">{match.awayTeam.name}</div>
                      <div className="text-sm text-gray-500">{match.awayTeam.country}</div>
                    </motion.div>
                  </div>

                  {/* Stats Section */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{match.totalContests}</div>
                      <div className="text-sm text-blue-700 font-medium">Contests Available</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">₹{(match.totalPrizePool / 1000).toFixed(0)}K</div>
                      <div className="text-sm text-green-700 font-medium">Total Prize Pool</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      to={`/dashboard/matches/${match.id}/contests`}
                      className="group relative overflow-hidden bg-gradient-to-r from-primary-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105 text-center"
                    >
                      <span className="relative z-10 flex items-center justify-center space-x-2">
                        <span>🎯</span>
                        <span>View Contests</span>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                    
                    <Link
                      to={`/dashboard/create-contest/${match.id}`}
                      className="group relative overflow-hidden bg-white border-2 border-primary-600 text-primary-600 font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:bg-primary-600 hover:text-white hover:shadow-lg hover:scale-105 text-center"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <span>⚡</span>
                        <span>Create Contest</span>
                      </span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Enhanced Empty State */}
      {filteredMatches.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="relative">
            <div className="text-8xl mb-6 animate-bounce">⚽</div>
            <div className="absolute -top-2 -right-2 text-2xl animate-spin">🌟</div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            No matches found for your filters
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Try adjusting your filters or check back later for new exciting matches. 
            The best contests are always around the corner!
          </p>
          <div className="space-y-4">
            <button
              onClick={() => {
                setFilters(prev => ({ ...prev, status: ['upcoming', 'live'] }));
                setSelectedLeague('all');
              }}
              className="bg-gradient-to-r from-primary-600 to-blue-600 text-white font-semibold py-3 px-8 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              🔄 Reset Filters
            </button>
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              <span>🔥 {matches.filter(m => m.status === 'live').length} Live</span>
              <span>⏰ {matches.filter(m => m.status === 'upcoming').length} Upcoming</span>
              <span>✅ {matches.filter(m => m.status === 'completed').length} Completed</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MatchesPage;