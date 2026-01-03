import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Landing and Auth Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar, { SidebarProvider, useSidebar } from './components/layout/Sidebar';

// Page Components
import HomePage from './pages/HomePage';
import MatchesPage from './pages/MatchesPage';
import ContestsPage from './pages/ContestsPage';
import ContestsListPage from './pages/ContestsListPage';
import TeamBuilderPage from './pages/TeamBuilderPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import HistoryPage from './pages/HistoryPage';
import CreateContestPage from './pages/CreateContestPage';
import MyTeamsPage from './pages/MyTeamsPage';
import PlayersPage from './pages/Playerspage';
import LiveScoresPage from './pages/LiveScoresPage';

// Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { WalletProvider } from './contexts/walletconnect';

// Main Layout Component
const MainLayout: React.FC = () => {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/20 relative">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm-30 0c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
             backgroundSize: '40px 40px'
           }}>
      </div>
      
      <Navbar />
      <div className="flex relative">
        <Sidebar />
        <motion.main 
          initial={false}
          animate={{ 
            marginLeft: isCollapsed ? 64 : 256
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex-1 lg:block hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-6 py-8"
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/teams" element={<MyTeamsPage />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/contests" element={<ContestsListPage />} />
              <Route path="/matches/:matchId/contests" element={<ContestsPage />} />
              <Route path="/contests/:contestId/create-team" element={<TeamBuilderPage />} />
              <Route path="/team-builder" element={<TeamBuilderPage />} />
              <Route path="/contests/:contestId/leaderboard" element={<LeaderboardPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/create-contest/:matchId" element={<CreateContestPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/live-scores" element={<LiveScoresPage />} />
            </Routes>
          </motion.div>
        </motion.main>
        {/* Mobile main content */}
        <main className="flex-1 lg:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-6 py-8"
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/teams" element={<MyTeamsPage />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/contests" element={<ContestsListPage />} />
              <Route path="/matches/:matchId/contests" element={<ContestsPage />} />
              <Route path="/contests/:contestId/create-team" element={<TeamBuilderPage />} />
              <Route path="/team-builder" element={<TeamBuilderPage />} />
              <Route path="/contests/:contestId/leaderboard" element={<LeaderboardPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/create-contest/:matchId" element={<CreateContestPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/live-scores" element={<LiveScoresPage />} />
            </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

// Main App Content (handles routing and authentication)
const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes - Always accessible */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/auth/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/auth/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
        
        {/* Protected Routes - Only accessible when authenticated */}
        <Route path="/dashboard/*" element={user ? <AuthenticatedApp /> : <Navigate to="/" replace />} />
      </Routes>
      
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-white shadow-lg',
          duration: 4000,
        }}
      />
    </Router>
  );
};

// Authenticated App with Main Layout
const AuthenticatedApp: React.FC = () => {
  return (
    <SocketProvider>
      <SidebarProvider>
        <MainLayout />
      </SidebarProvider>
    </SocketProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;