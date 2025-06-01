import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';

// Add type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  balance: string;
  chainId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [chainId, setChainId] = useState<number | null>(null);
  const { toast } = useToast();

  // Initialize from local storage if available
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && localStorage.getItem('isWalletConnected') === 'true') {
        await connectWallet();
      }
    };
    checkConnection();
  }, []);

  // Update listeners when provider changes
  useEffect(() => {
    if (provider && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== address) {
          setAddress(accounts[0]);
          updateBalance(accounts[0]);
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        const newChainId = parseInt(chainIdHex, 16);
        setChainId(newChainId);
        window.location.reload();
      };

      const handleDisconnect = () => {
        disconnectWallet();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('disconnect', handleDisconnect);
        }
      };
    }
  }, [provider, address]);

  const updateBalance = async (walletAddress: string) => {
    if (provider && walletAddress) {
      try {
        const balanceWei = await provider.getBalance(walletAddress);
        const balanceEth = ethers.formatEther(balanceWei);
        setBalance(parseFloat(balanceEth).toFixed(4));
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await ethProvider.send('eth_requestAccounts', []);

        if (accounts.length > 0) {
          const ethSigner = await ethProvider.getSigner();
          const network = await ethProvider.getNetwork();

          setProvider(ethProvider);
          setSigner(ethSigner);
          setAddress(accounts[0]);
          setIsConnected(true);
          setChainId(Number(network.chainId));

          localStorage.setItem('isWalletConnected', 'true');

          updateBalance(accounts[0]);
          toast.success('Wallet connected successfully!');
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        toast.error('Failed to connect wallet. Please try again.');
      }
    } else {
      toast.error('MetaMask not installed. Please install MetaMask to use this app.');
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
    setBalance('0');
    setChainId(null);
    localStorage.removeItem('isWalletConnected');
    toast.success('Wallet disconnected');
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        provider,
        signer,
        balance,
        chainId,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
