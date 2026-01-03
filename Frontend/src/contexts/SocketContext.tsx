import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Match, LeaderboardEntry, Notification } from '../types';

export interface LiveScoreData {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  currentMinute: number;
  status: string;
  events: any[];
  stats: any;
  lastUpdated: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  liveMatches: Match[];
  liveScores: LiveScoreData[];
  leaderboardUpdates: LeaderboardEntry[];
  notifications: Notification[];
  joinMatchRoom: (matchId: string) => void;
  leaveMatchRoom: (matchId: string) => void;
  joinAllLiveMatches: () => void;
  markNotificationAsRead: (notificationId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [liveScores, setLiveScores] = useState<LiveScoreData[]>([]);
  const [leaderboardUpdates, setLeaderboardUpdates] = useState<LeaderboardEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Real WebSocket connection to backend
    const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      setIsConnected(true);
    });

    newSocket.on('connected', (data) => {
      console.log('📡 WebSocket confirmation:', data.message);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    // Live score update event
    newSocket.on('live_score_update', (data: LiveScoreData) => {
      console.log('📊 Live score update received:', data);
      setLiveScores(prev => {
        const index = prev.findIndex(ls => ls.matchId === data.matchId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = data;
          return updated;
        } else {
          return [...prev, data];
        }
      });
    });

    // All live scores event
    newSocket.on('all_live_scores', (scores: LiveScoreData[]) => {
      console.log('📊 All live scores received:', scores.length);
      setLiveScores(scores);
    });

    // Leaderboard update event (keeping for contest leaderboards)
    newSocket.on('leaderboard_update', (updates: LeaderboardEntry[]) => {
      console.log('📈 Leaderboard update received');
      setLeaderboardUpdates(updates);
    });

    // Match update event
    newSocket.on('match_update', (data: any) => {
      console.log('⚽ Match update received:', data);
      // Handle match updates
    });

    setSocket(newSocket);

    // Mock initial notifications (can be replaced with real notifications API)
    setNotifications([
      {
        id: 'notif-1',
        userId: 'user-1',
        type: 'result',
        title: 'Contest Result',
        message: 'You finished 3rd in Premier League Contest!',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: 'notif-2',
        userId: 'user-1',
        type: 'match_start',
        title: 'Match Starting',
        message: 'Chelsea vs Arsenal starts in 15 minutes',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
      }
    ]);

    // Cleanup on unmount
    return () => {
      console.log('🔌 Closing WebSocket connection');
      newSocket.close();
    };
  }, []);

  const joinMatchRoom = (matchId: string) => {
    if (socket) {
      console.log(`📍 Joining match room: ${matchId}`);
      socket.emit('join_match', { matchId });
    }
  };

  const leaveMatchRoom = (matchId: string) => {
    if (socket) {
      console.log(`📤 Leaving match room: ${matchId}`);
      socket.emit('leave_match', { matchId });
    }
  };

  const joinAllLiveMatches = () => {
    if (socket) {
      console.log('📍 Joining all live match rooms');
      socket.emit('join_all_live');
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true } 
          : notif
      )
    );
  };

  const value = {
    socket,
    isConnected,
    liveMatches,
    liveScores,
    leaderboardUpdates,
    notifications,
    joinMatchRoom,
    leaveMatchRoom,
    joinAllLiveMatches,
    markNotificationAsRead
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
