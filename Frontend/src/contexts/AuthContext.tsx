import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserTeam, Transaction } from '../types';

// The API_URL will be read from your .env file
const API_URL = process.env.REACT_APP_API_URL;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  getUserTeams: () => UserTeam[];
  getTransactionHistory: () => Transaction[];
  updateUserRank: (contestPlayed?: boolean, contestWon?: boolean, winnings?: number) => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // This function will run when the app loads to check if a user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('play11_token');
      
      if (token) {
        try {
          // Try to verify existing token with the backend
          const response = await fetch(`${API_URL}/api/users/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            // Map backend user data to frontend User interface
            const mappedUser: User = {
              id: userData._id || userData.id,
              username: userData.username,
              email: userData.email,
              avatar: userData.avatar || undefined,
              balance: userData.balance || 100,
              totalWinnings: userData.totalWinnings || 0,
              totalContests: userData.totalContests || 0,
              winRate: userData.winRate || 0,
              badges: userData.badges || [],
              createdAt: userData.createdAt || new Date().toISOString(),
              rankPoints: userData.rankPoints || 0,
              globalRank: userData.globalRank || 999999,
              contestsPlayed: userData.contestsPlayed || 0,
              contestsWon: userData.contestsWon || 0
            };
            setUser(mappedUser);
            setLoading(false);
            return;
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('play11_token');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('play11_token');
        }
      }
      
      // No valid token, user needs to login/register
      setUser(null);
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { token, user: userData } = await response.json();
        localStorage.setItem('play11_token', token);
        
        // Map backend user data to frontend User interface
        const mappedUser: User = {
          id: userData._id || userData.id,
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar || undefined,
          balance: userData.balance || 100,
          totalWinnings: userData.totalWinnings || 0,
          totalContests: userData.totalContests || 0,
          winRate: userData.winRate || 0,
          badges: userData.badges || [],
          createdAt: userData.createdAt || new Date().toISOString(),
          rankPoints: userData.rankPoints || 0,
          globalRank: userData.globalRank || 999999,
          contestsPlayed: userData.contestsPlayed || 0,
          contestsWon: userData.contestsWon || 0
        };
        setUser(mappedUser);
      } else {
        const error = await response.json();
        throw new Error(error.msg || error.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('play11_token');
    setUser(null);
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const { token, user: backendUser } = await response.json();
        localStorage.setItem('play11_token', token);
        
        // Map backend user data to frontend User interface
        const mappedUser: User = {
          id: backendUser._id || backendUser.id,
          username: backendUser.username,
          email: backendUser.email,
          avatar: backendUser.avatar || undefined,
          balance: backendUser.balance || 100,
          totalWinnings: 0,
          totalContests: 0,
          winRate: 0,
          badges: [],
          createdAt: backendUser.createdAt || new Date().toISOString(),
          rankPoints: backendUser.rankPoints || 0,
          globalRank: backendUser.globalRank || 999999,
          contestsPlayed: backendUser.contestsPlayed || 0,
          contestsWon: backendUser.contestsWon || 0
        };
        setUser(mappedUser);
      } else {
        const error = await response.json();
        throw new Error(error.msg || error.message || 'Registration failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // These functions can be implemented later with their respective backend endpoints
  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      setLoading(true);
      // In a real implementation, this would call the backend
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser({ ...user, ...data });
    } catch (error) {
      throw new Error('Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRank = async (contestPlayed: boolean = false, contestWon: boolean = false, winnings: number = 0) => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('play11_token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/users/update-rank`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contestPlayed: contestPlayed ? 1 : 0,
          contestWon: contestWon ? 1 : 0,
          winnings
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        const mappedUser: User = {
          id: updatedUser._id || updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          avatar: updatedUser.avatar || undefined,
          balance: updatedUser.balance || 100,
          totalWinnings: updatedUser.totalWinnings || 0,
          totalContests: updatedUser.totalContests || 0,
          winRate: updatedUser.winRate || 0,
          badges: updatedUser.badges || [],
          createdAt: updatedUser.createdAt || new Date().toISOString(),
          rankPoints: updatedUser.rankPoints || 0,
          globalRank: updatedUser.globalRank || 999999,
          contestsPlayed: updatedUser.contestsPlayed || 0,
          contestsWon: updatedUser.contestsWon || 0
        };
        setUser(mappedUser);
      }
    } catch (error) {
      console.error('Failed to update user rank:', error);
    }
  };

  const getUserTeams = (): UserTeam[] => {
    return [];
  };

  const getTransactionHistory = (): Transaction[] => {
    return [];
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    updateUserRank,
    getUserTeams,
    getTransactionHistory
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
