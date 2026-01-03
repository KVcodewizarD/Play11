import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const AuthWrapper: React.FC = () => {
  const { loading } = useAuth();
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login');

  const switchToRegister = () => setCurrentView('register');
  const switchToLogin = () => setCurrentView('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-white text-lg">Loading PLAY11...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full"></div>
        <div className="absolute top-20 right-20 w-16 h-16 border border-white rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-white rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-12 h-12 border border-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-white rounded-full"></div>
      </div>

      {/* Auth Forms */}
      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {currentView === 'login' ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <LoginForm onSwitchToRegister={switchToRegister} />
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <RegisterForm onSwitchToLogin={switchToLogin} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-white text-sm opacity-75">
          © 2025 PLAY11. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthWrapper;