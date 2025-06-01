'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { useWalletAuth } from '../hooks/use-wallet-auth';

// Detect if we're running in an iframe (like Safe app)
const isIframe = typeof window !== 'undefined' && window !== window.parent;

interface WalletConnectButtonProps {
  className?: string;
  onDisconnect?: () => void;
  onConnect?: () => void;
  redirectOnConnect?: string;
}

export function WalletConnectButton({
  className = '',
  onDisconnect,
  onConnect,
  redirectOnConnect,
}: WalletConnectButtonProps) {
  const { address, isConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { checkAuthStatus, isAuthenticated, walletAddress, disconnect, recentlyDisconnected, refreshAuth } =
    useWalletAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isSmartContractWallet, setIsSmartContractWallet] = useState(false);
  const connectionCheckedRef = useRef(false);
  const authCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const signTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle custom disconnect behavior
  const handleDisconnect = async () => {
    try {
      // First disconnect from our backend
      await disconnect();

      // Then disconnect from wagmi/rainbowkit
      wagmiDisconnect();

      if (onDisconnect) {
        onDisconnect();
      } else if (redirectOnConnect && typeof window !== 'undefined') {
        // Default behavior: redirect to home page
        window.location.href = '/';
      }
    } catch (error) {
      console.error('[WalletConnectButton] Error during disconnect:', error);
    }
  };

  // Handle Smart Contract Wallet detection (like Safe)
  useEffect(() => {
    if (isConnected && address) {
      const detectSmartContractWallet = async () => {
        // Check if the wallet is a Smart Contract by looking at the providers
        // This is a simple heuristic and may need to be refined
        try {
          const inSafeApp = isIframe && (window as any).parent?.frames?.['safeApp'];
          const provider = (window as any).ethereum;
          const isSafeWallet =
            (provider && provider.isSafe) ||
            (provider && provider.safe) ||
            (provider && provider.provider && provider.provider.safe) ||
            inSafeApp;

          // Look for clues that we're using a Safe or other smart contract wallet
          setIsSmartContractWallet(!!isSafeWallet);
          console.log(`[WalletConnectButton] Detected ${isSafeWallet ? 'Smart Contract' : 'EOA'} wallet`);
        } catch (error) {
          console.error('[WalletConnectButton] Error detecting wallet type:', error);
        }
      };

      detectSmartContractWallet();
    }
  }, [isConnected, address]);

  // Manually authenticate when RainbowKit connects wallet
  useEffect(() => {
    // Skip auto-authentication if recently disconnected
    if (recentlyDisconnected) {
      return;
    }

    // if (isConnected && address && signMessageAsync && !isAuthenticated && !isSigning) {
    //   const authenticateWithWallet = async () => {
    //     try {
    //       setIsSigning(true);
    //       console.log('Starting SIWE authentication flow');

    //       // Get a nonce from the backend API using server action
    //       console.log('Requesting nonce for address:', address);
    //       const { message } = await generateSiweNonce(address);

    //       if (!message) {
    //         console.error('Failed to receive authentication message from server');
    //         throw new Error('Failed to generate authentication message');
    //       }

    //       console.log('Received SIWE message:', message.substring(0, 50) + '...');

    //       // Extract the nonce from the message for logging
    //       const nonceMatch = message.match(/nonce: ([a-f0-9]+)/i);
    //       const nonce = nonceMatch ? nonceMatch[1] : 'unknown';
    //       console.log('Extracted nonce:', nonce);

    //       // Special handling for smart contract wallets
    //       let signature = '';
    //       if (isSmartContractWallet) {
    //         try {
    //           console.log('Smart contract wallet detected, requesting signature');

    //           // For Safe and other smart contract wallets, there might be a delay
    //           // between signing and getting the transaction confirmed on-chain
    //           signature = await signMessageAsync({ message });

    //           // Set a timeout to check auth status periodically for contract wallet
    //           // This helps with Safe where the signature is verified on-chain
    //           if (signTimeoutRef.current) {
    //             clearTimeout(signTimeoutRef.current);
    //           }

    //           signTimeoutRef.current = setTimeout(async () => {
    //             // Once the signature is sent, just proceed with verification
    //             await checkAuthStatus();
    //             setIsSigning(false);

    //             if (onConnect) {
    //               onConnect();
    //             }

    //             if (redirectOnConnect && typeof window !== 'undefined') {
    //               window.location.href = redirectOnConnect;
    //             }
    //           }, 5000); // Give time for the transaction to be processed

    //           return;
    //         } catch (error) {
    //           console.error('[WalletConnectButton] Error during smart contract wallet signing:', error);
    //           setIsSigning(false);
    //           throw error;
    //         }
    //       } else {
    //         // Regular EOA wallet
    //         console.log('Requesting user to sign the message with EOA wallet');
    //         signature = await signMessageAsync({ message });
    //         console.log('Message signed successfully, signature:', signature.substring(0, 10) + '...');
    //       }

    //       // Authenticate with the server using server action
    //       console.log('Verifying signature with server');
    //       const authResult = await verifySiweSignature(message, signature);

    //       if (authResult.success) {
    //         console.log('Authentication successful');
    //         await checkAuthStatus();

    //         // Call onConnect callback if provided
    //         if (onConnect) {
    //           onConnect();
    //         }

    //         // Redirect after successful authentication if specified
    //         if (redirectOnConnect && typeof window !== 'undefined') {
    //           window.location.href = redirectOnConnect;
    //         }
    //       } else {
    //         console.error('Authentication failed:', authResult.error);
    //       }
    //     } catch (error) {
    //       console.error('[WalletConnectButton] Error during authentication:', error);
    //     } finally {
    //       setIsSigning(false);
    //     }
    //   };

    //   authenticateWithWallet();
    // }
  }, [
    isConnected,
    address,

    // checkAuthStatus,
    // signMessageAsync,
    // isAuthenticated,
    // isSigning,
    // recentlyDisconnected,
    // onConnect,
    // redirectOnConnect,
    // isSmartContractWallet,
  ]);

  // Check auth status when wallet connection changes with debouncing
  useEffect(() => {
    // Clear any existing timeout to prevent multiple checks
    if (authCheckTimeoutRef.current) {
      clearTimeout(authCheckTimeoutRef.current);
      authCheckTimeoutRef.current = null;
    }

    // Only check if connected and not already checking
    if (isConnected && address && !isCheckingAuth && !connectionCheckedRef.current) {
      setIsCheckingAuth(true);

      // Debounce the auth check with a longer timeout (1000ms instead of 500ms)
      authCheckTimeoutRef.current = setTimeout(async () => {
        try {
          await checkAuthStatus();
        } catch (error) {
          console.error('[WalletConnectButton] Error checking auth status:', error);
        } finally {
          setIsCheckingAuth(false);
          connectionCheckedRef.current = true;
          authCheckTimeoutRef.current = null;
        }
      }, 1000);
    }

    // Reset when disconnected
    if (!isConnected && connectionCheckedRef.current) {
      connectionCheckedRef.current = false;
    }

    // Cleanup function to clear timeout if component unmounts
    return () => {
      if (authCheckTimeoutRef.current) {
        clearTimeout(authCheckTimeoutRef.current);
        authCheckTimeoutRef.current = null;
      }
      if (signTimeoutRef.current) {
        clearTimeout(signTimeoutRef.current);
        signTimeoutRef.current = null;
      }
    };
  }, [isConnected, address, checkAuthStatus, isCheckingAuth]);

  // Watch for rainbowkit disconnect events
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      // If rainbowkit disconnects but our auth context still thinks we're logged in
      handleDisconnect();
    }
  }, [isConnected, isAuthenticated]);

  // Support for iframe embedding (like Safe apps)
  useEffect(() => {
    if (isIframe) {
      // Add special styles or handling for iframe context
      console.log('Running in iframe context (possibly Safe app)');

      // Try to refresh auth on iframe load
      if (isConnected && address) {
        setTimeout(() => {
          refreshAuth().then((result) => {
            if (result.success) {
              console.log('Successfully refreshed auth in iframe context');
            }
          });
        }, 1000);
      }
    }
  }, [isConnected, address, refreshAuth]);

  return (
    <div className={className}>
      <ConnectButton
        chainStatus="icon"
        accountStatus={{
          smallScreen: 'avatar',
          largeScreen: 'full',
        }}
        showBalance={false}
        label="Connect Wallet"
      />
      {isAuthenticated && (
        <button
          onClick={handleDisconnect}
          className="ml-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Sign Out
        </button>
      )}
    </div>
  );
}

export default WalletConnectButton;
