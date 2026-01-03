import React, { useState, createContext, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

// Create context for sidebar state
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}>({ isCollapsed: false, setIsCollapsed: () => {} });

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

const Sidebar: React.FC = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/dashboard/', icon: '🏠' },
    { name: 'Matches', href: '/dashboard/matches', icon: '⚽' },
    { name: 'Contests', href: '/dashboard/contests', icon: '🏅' },
    { name: 'My Teams', href: '/dashboard/teams', icon: '👥' },
    { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: '🏆' },
    { name: 'History', href: '/dashboard/history', icon: '📊' },
    { name: 'Notifications', href: '/dashboard/notifications', icon: '🔔' },
    { name: 'Live Scores', href: '/dashboard/live-scores', icon: '📡' },
  ];

  return (
    <motion.div
      initial={{ width: 256 }}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/80 backdrop-blur-md border-r border-white/30 z-40 lg:block hidden overflow-hidden shadow-lg"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 via-white/60 to-green-50/10"></div>
      
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white/90 backdrop-blur-sm border border-white/40 rounded-full w-6 h-6 flex items-center justify-center hover:bg-white/100 z-20 shadow-md transition-all duration-200"
      >
        <span className={`text-xs transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
          ◀
        </span>
      </button>

      {/* Navigation */}
      <nav className="mt-8 px-4 relative z-10">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/dashboard/' && location.pathname.startsWith(item.href));
            
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-xl flex-shrink-0 w-6 flex justify-center">{item.icon}</span>
                  <motion.span
                    initial={false}
                    animate={{ 
                      opacity: isCollapsed ? 0 : 1,
                      width: isCollapsed ? 0 : 'auto',
                      marginLeft: isCollapsed ? 0 : 12
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Quick Stats */}
      

      {/* Upcoming Matches */}
      {/* {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 px-4"
        >
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Upcoming Matches
          </h3>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-gray-900">MAN vs LIV</div>
                  <div className="text-gray-500">2 hours left</div>
                </div>
                <div className="text-primary-600 font-semibold">24 contests</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-gray-900">CHE vs ARS</div>
                  <div className="text-gray-500">4 hours left</div>
                </div>
                <div className="text-primary-600 font-semibold">18 contests</div>
              </div>
            </div>
          </div>
        </motion.div>
      )} */}
    </motion.div>
  );
};

export default Sidebar;