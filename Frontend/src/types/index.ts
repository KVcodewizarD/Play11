// Types for the PLAY11 application

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  balance: number;
  totalWinnings: number;
  totalContests: number;
  winRate: number;
  badges: Badge[];
  createdAt: string;
  // New ranking system fields
  rankPoints: number;
  globalRank: number;
  contestsPlayed: number;
  contestsWon: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface Team {
  id: string;
  name: string;
  country: string;
  logo: string;
  players: Player[];
}

export interface Player {
  id: string;
  name: string;
  position: PlayerPosition;
  team: string;
  country: string;
  credits: number;
  points: number;
  isPlaying: boolean;
  recentForm: number[];
  avatar?: string;
  stats: PlayerStats;
  // New ranking system fields
  globalRanking: number;
}

export interface PlayerStats {
  goals: number;
  assists: number;
  cleanSheets: number;
  saves: number;
  yellowCards: number;
  redCards: number;
  matchesPlayed: number;
}

export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  startTime: string;
  status: MatchStatus;
  venue: string;
  weather?: string;
  totalContests: number;
  totalPrizePool: number;
  lineupAnnounced: boolean;
  league?: string;
  leagueIcon?: string;
  score?: {
    home: number;
    away: number;
  };
}

export type MatchStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';

export interface Contest {
  id: string;
  matchId: string;
  name: string;
  entryFee: number;
  maxParticipants: number;
  currentParticipants: number;
  prizePool: number;
  maxTeamsPerUser: number;
  isPrivate: boolean;
  privateCode?: string;
  createdBy: string;
  prizeBreakup: PrizeBreakup[];
  startTime: string;
  status: ContestStatus;
  participants: ContestParticipant[];
}

export type ContestStatus = 'open' | 'closed' | 'live' | 'completed' | 'cancelled';

export interface PrizeBreakup {
  rank: string;
  prize: number;
  winnerCount: number;
}

export interface ContestParticipant {
  userId: string;
  username: string;
  teamsCount: number;
  totalPoints: number;
  rank: number;
}

export interface UserTeam {
  id: string;
  name: string;
  contestId: string;
  players: SelectedPlayer[];
  captain: string;
  viceCaptain: string;
  totalCredits: number;
  totalPoints: number;
  createdAt: string;
  isSubmitted: boolean;
}

export interface SelectedPlayer {
  playerId: string;
  player: Player;
  isCaptain: boolean;
  isViceCaptain: boolean;
  points: number;
  multiplier: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export type NotificationType = 'match_start' | 'deadline' | 'result' | 'contest' | 'payment' | 'general';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  createdAt: string;
  contestId?: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'contest_entry' | 'winnings' | 'refund';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  teamName: string;
  totalPoints: number;
  captain: string;
  viceCaptain: string;
  isCurrentUser?: boolean;
}

export interface GlobalStats {
  totalUsers: number;
  totalMatches: number;
  totalContests: number;
  totalPrizePool: number;
}

export interface MatchFilters {
  status: MatchStatus[];
  teams: string[];
  dateRange: {
    start: string;
    end: string;
  };
  sortBy: 'date' | 'popularity' | 'prize_pool';
  sortOrder: 'asc' | 'desc';
}

export interface ContestFilters {
  entryFee: {
    min: number;
    max: number;
  };
  participants: {
    min: number;
    max: number;
  };
  contestType: 'all' | 'public' | 'private';
  sortBy: 'entry_fee' | 'participants' | 'prize_pool';
  sortOrder: 'asc' | 'desc';
}