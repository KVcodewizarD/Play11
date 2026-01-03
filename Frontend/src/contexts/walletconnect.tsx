import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface WalletContextType {
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Check if running in browser environment
const isBrowser = typeof window !== 'undefined';

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing connection on mount
  useEffect(() => {
    if (isBrowser && window.ethereum) {
      checkConnection();
    }
  }, []);

  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
    }
  };

  const connectWallet = useCallback(async () => {
    if (!isBrowser) {
      setError('Wallet connection is only available in browser environment');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Check if MetaMask is installed
      if (window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
            } else {
              setAccount(null);
            }
          });
          
          // Listen for chain changes
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });
        }
      } else {
        // MetaMask is not installed
        setError('Please install MetaMask or another Web3 wallet');
        // Optionally redirect to MetaMask installation
        window.open('https://metamask.io/download/', '_blank');
      }
    } catch (err: any) {
      console.error('Failed to connect wallet:', err);
      if (err.code === 4001) {
        setError('Please connect to your wallet');
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      // Remove event listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
      
      setAccount(null);
      setError(null);
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    }
  }, []);

  const value = {
    account,
    connectWallet,
    disconnectWallet,
    isConnected: !!account,
    isConnecting,
    error,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}