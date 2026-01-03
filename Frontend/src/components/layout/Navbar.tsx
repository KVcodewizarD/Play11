import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useWallet } from '../../contexts/walletconnect';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications } = useSocket();
  const { account, connectWallet, disconnectWallet, isConnected, isConnecting, error } = useWallet();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showPlayersPage, setShowPlayersPage] = useState(false);
  const location = useLocation();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-menu') && !target.closest('.wallet-menu')) {
        setShowProfileMenu(false);
        setShowWalletMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error('Wallet connection failed:', err);
    }
  };

  const handleWalletDisconnect = async () => {
    await disconnectWallet();
    setShowWalletMenu(false);
  };

  // Helper to display a shortened wallet address
  const shortAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-transparent to-green-50/30 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center"
              >
                <span className="text-white font-bold text-xl">⚽</span>
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                PLAY11
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/dashboard/matches" active={location.pathname.includes('/matches')}>
              Matches
            </NavLink>
            <NavLink to="/dashboard/profile" active={location.pathname === '/dashboard/profile'}>
              My Teams
            </NavLink>
            <NavLink to="/dashboard/Players" active={location.pathname === '/dashboard/Players'}>
              Players
            </NavLink>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Wallet Connection */}
            <div className="relative">
              {isConnected ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  className="hidden sm:flex items-center space-x-2 bg-blue-50 text-blue-800 px-3 py-2 rounded-lg font-mono text-sm hover:bg-blue-100"
                >
                  <span>🔗</span>
                  <span>{shortAddress(account)}</span>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWalletConnect}
                  disabled={isConnecting}
                  className="hidden sm:flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-700 border-t-transparent"></div>
                      <span className="font-semibold text-gray-700">Connecting...</span>
                    </>
                  ) : (
                    <>
                      <span>💰</span>
                      <span className="font-semibold text-gray-700">Connect Wallet</span>
                    </>
                  )}
                </motion.button>
              )}
              
              {/* Wallet Menu */}
              {showWalletMenu && isConnected && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="wallet-menu absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Wallet Connected</p>
                    <p className="text-xs text-gray-500 font-mono">{account}</p>
                  </div>
                  <button
                    onClick={handleWalletDisconnect}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    Disconnect Wallet
                  </button>
                </motion.div>
              )}
              
              {/* Error Display */}
              {error && (
                <div className="absolute right-0 mt-2 w-64 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  {error}
                </div>
              )}
            </div>
           
            {user ? (
              <>
                {/* Balance */}
                <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-lg">
                  <span className="text-green-600 font-medium">₹{user.balance?.toLocaleString()}</span>
                  <button className="text-green-600 hover:text-green-700 text-sm">
                    Add Cash
                  </button>
                </div>

                {/* User Rank */}
                <div className="flex items-center space-x-2 bg-purple-100 px-3 py-1 rounded-lg">
                  <span className="text-purple-600 text-sm">🏆</span>
                  <span className="text-purple-600 font-medium text-sm">
                    Rank #{user.globalRank?.toLocaleString() || 'N/A'}
                  </span>
                  <span className="text-purple-500 text-xs">
                    ({user.rankPoints || 0} pts)
                  </span>
                </div>

                {/* Notifications */}
                <Link to="/dashboard/notifications" className="relative p-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    🔔
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </motion.div>
                </Link>

                {/* Profile Menu */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32'}
                      alt={user.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="hidden sm:block font-medium">{user.username}</span>
                  </motion.button>

                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="profile-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                    >
                      <Link
                        to="/dashboard/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/dashboard/history"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Transaction History
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children }) => (
  <Link
    to={to}
    className={`font-medium transition-colors duration-200 ${
      active
        ? 'text-primary-600 border-b-2 border-primary-600'
        : 'text-gray-700 hover:text-primary-600'
    }`}
  >
    {children}
  </Link>
);

export default Navbar;