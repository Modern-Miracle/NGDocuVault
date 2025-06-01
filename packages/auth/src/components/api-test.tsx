'use client';

import { useState, useEffect } from 'react';
import { Button } from '@docu/ui/components/button';
import { Card, CardHeader, CardTitle, CardContent } from '@docu/ui/components/card';
import { ethers } from 'ethers';
import { useWalletAuth } from '@docu/auth/hooks/use-wallet-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@docu/ui/components/tabs';
import { Input } from '@docu/ui/components/input';
import { Label } from '@docu/ui/components/label';
import { useRouter } from 'next/navigation';
import { verifySiweSignature, generateSiweNonce, refreshAuthToken } from '@docu/auth/actions/wallet-api';
import styles from './api-test.module.css';

// Avoid redefining window.ethereum interface
declare global {
  interface Window {
    ethereum?: any;
  }
}

export function ApiTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, walletAddress, refreshAuth, disconnect } = useWalletAuth();
  const [tokenData, setTokenData] = useState<{ expiresAt?: number; refreshToken?: string }>({});
  const [countdownTime, setCountdownTime] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Update countdown timer every second if token exists
    if (tokenData.expiresAt) {
      const timer = setInterval(() => {
        const now = Date.now();
        const diff = tokenData.expiresAt! - now;

        if (diff <= 0) {
          setCountdownTime('Expired');
          clearInterval(timer);
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setCountdownTime(`${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [tokenData.expiresAt]);

  // Test authentication flow
  async function testAuthentication() {
    try {
      setIsLoading(true);
      setTestResult('Testing authentication flow...');

      // Check if window.ethereum is available
      if (!window.ethereum) {
        setTestResult('No wallet detected. Please install MetaMask.');
        return;
      }

      // Request accounts
      const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[];
      const address = accounts[0];

      if (!address) {
        setTestResult('No accounts found. Please connect your wallet first.');
        return;
      }

      // Step 1: Request a nonce to sign
      setTestResult('Requesting authentication challenge...');
      try {
        // Clear previous data
        setTokenData({});

        // Generate new nonce for SIWE - Use chain ID 31337 to match your development environment
        const chainId = '31337'; // Hardhat local network chain ID
        const { message, expiresAt } = await generateSiweNonce(address, chainId);

        // Validate the message structure
        if (!message || typeof message !== 'string') {
          setTestResult('Error: Invalid message format received from server');
          return;
        }

        // Validate expiration time format
        let expirationDate = 'Unknown';
        try {
          if (expiresAt) {
            const date = new Date(expiresAt);
            if (!isNaN(date.getTime())) {
              expirationDate = date.toLocaleString();
            }
          }
        } catch (e) {
          console.error('Error parsing expiration date:', e);
        }

        setTestResult(
          `Received challenge message to sign. Waiting for wallet confirmation...\nExpires: ${expirationDate}`
        );

        // Extract the nonce for troubleshooting
        const nonceMatch = message.match(/Nonce: ([a-f0-9]+)/i);
        const nonce = nonceMatch && nonceMatch[1] ? nonceMatch[1] : 'unknown';
        console.log(`Challenge nonce: ${nonce}`);

        // Add a longer delay to ensure the challenge is registered in the backend
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Step 2: Sign the challenge message
        const signature = (await window.ethereum.request({
          method: 'personal_sign',
          params: [message, address],
        })) as string;

        // Step 3: Verify signature locally first
        const recoveredAddress = ethers.verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
          setTestResult('Signature verification failed locally.');
          return;
        }

        setTestResult(`Signature created successfully. Verifying with backend...`);

        // Step 4: Send to our authentication endpoint
        // Add small delay before verification to ensure challenge is properly registered
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const result = await verifySiweSignature(message, signature);

        if (result.success) {
          console.log('Authentication response:', result);

          // Extract data directly from the auth response
          const expiresAt = result.auth?.expiresIn ? Date.now() + result.auth.expiresIn * 1000 : undefined;

          // Store session data in localStorage for persistence
          try {
            if (result.auth?.refreshToken) {
              localStorage.setItem('auth_refresh_token', result.auth.refreshToken);
            }
            if (expiresAt) {
              localStorage.setItem('auth_expires_at', expiresAt.toString());
            }
            if (result.address) {
              localStorage.setItem('auth_address', result.address);
            }
          } catch (error) {
            console.error('Error storing auth data in localStorage:', error);
          }

          // Update token data
          setTokenData({
            expiresAt: expiresAt,
            refreshToken: result.auth?.refreshToken,
          });

          setTestResult(
            `Authentication successful!\nAddress: ${result.address}\nToken expiration: ${expiresAt ? new Date(expiresAt).toLocaleString() : 'Unknown'}`
          );
        } else {
          // Check if this is a "no active challenge" error that requires a new challenge
          if (
            result.error?.includes('No active challenge') ||
            result.error?.includes('Invalid challenge') ||
            result.error?.includes('challenge has already been used')
          ) {
            setTestResult(
              `Authentication failed: Challenge already used or invalid.\nRequesting a new challenge and trying again...`
            );

            // Get a new challenge automatically
            const newChallenge = await generateSiweNonce(address, chainId);

            // Wait for the challenge to register
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Sign the new challenge
            const newSignature = (await window.ethereum.request({
              method: 'personal_sign',
              params: [newChallenge.message, address],
            })) as string;

            // Verify the new signature
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const newResult = await verifySiweSignature(newChallenge.message, newSignature);

            if (newResult.success) {
              // Store refresh token from result in localStorage
              if (newResult.auth?.refreshToken) {
                localStorage.setItem('auth_refresh_token', newResult.auth.refreshToken);
              }

              // Update token data with expiration time
              const authData = await refreshAuth();

              setTokenData({
                expiresAt: authData.expiresAt,
                refreshToken: newResult.auth?.refreshToken,
              });

              setTestResult(
                `Authentication successful with new challenge!\nAddress: ${newResult.address}\nToken expiration: ${authData.expiresAt ? new Date(authData.expiresAt).toLocaleString() : 'Unknown'}`
              );
            } else {
              // Still failed with new challenge
              setTestResult(
                `Authentication failed with new challenge: ${newResult.error || 'Unknown error'}\n` +
                  `Please try again manually.`
              );
            }
          } else {
            // Provide detailed error information for other error types
            setTestResult(
              `Authentication failed: ${result.error || 'Unknown error'}\n` +
                `Message first line: ${message.split('\n')[0]}\n` +
                `Please make sure your wallet is connected to the correct network.`
            );
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setTestResult(`Authentication error: ${error instanceof Error ? error.message : String(error)}`);
      }
    } catch (error) {
      console.error('Test authentication error:', error);
      setTestResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Test token refresh
  async function testRefreshToken() {
    try {
      setIsLoading(true);
      setTestResult('Testing token refresh...');

      // Try to get refresh token from localStorage
      const storedToken = localStorage.getItem('auth_refresh_token');
      if (!storedToken) {
        setTestResult('No refresh token found. Please authenticate first.');
        setIsLoading(false);
        return;
      }

      console.log('Using stored refresh token for refresh');

      // First try the app refresh function
      try {
        // Call the app refresh function manually
        const authResult = await refreshAuth();
        if (authResult.success) {
          setTokenData({
            expiresAt: authResult.expiresAt,
            refreshToken: storedToken,
          });

          setTestResult(
            `Token refresh successful via app context!\nNew expiration: ${authResult.expiresAt ? new Date(authResult.expiresAt).toLocaleString() : 'Unknown'}`
          );
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('App context refresh failed, trying direct server action:', err);
      }

      // Call the server action directly with the token
      const result = await refreshAuthToken();

      if (result.success) {
        // Calculate expiration time and store the new token
        if (result.refreshToken) {
          localStorage.setItem('auth_refresh_token', result.refreshToken);
        }

        if (result.expiresAt) {
          localStorage.setItem('auth_expires_at', result.expiresAt.toString());
        }

        // Update state
        setTokenData({
          expiresAt: result.expiresAt,
          refreshToken: result.refreshToken || storedToken,
        });

        setTestResult(
          `Token refresh successful via direct call!\nNew expiration: ${result.expiresAt ? new Date(result.expiresAt).toLocaleString() : 'Unknown'}`
        );
      } else {
        setTestResult(`Token refresh failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Test refresh error:', error);
      setTestResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Test session revocation
  async function testRevokeSession() {
    try {
      setIsLoading(true);
      setTestResult('Revoking session...');

      // Import the server action directly
      const { siweLogout } = await import('@docu/auth/actions/wallet-api');

      // Call the server-side logout endpoint
      try {
        const logoutResult = await siweLogout();
        console.log('Logout result:', logoutResult);
      } catch (err) {
        console.warn('Server action logout failed:', err);
      }

      // Clean up localStorage
      localStorage.removeItem('auth_refresh_token');
      localStorage.removeItem('auth_expires_at');
      localStorage.removeItem('auth_address');

      // Then call the context disconnect function
      await disconnect();

      // Update local state
      setTokenData({});
      setTestResult('Session revoked successfully');

      // Manual redirect after a brief delay
      setTimeout(() => {
        router.push('/auth');
      }, 1500);
    } catch (error) {
      console.error('Revoke session error:', error);
      setTestResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>API Connection Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="auth">
          <TabsList className="mb-4">
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="token">Token Info</TabsTrigger>
          </TabsList>

          <TabsContent value="auth" className={styles.tabContent}>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Authentication Status</h3>
                <p className={isAuthenticated ? styles.statusAuthenticated : styles.statusUnauthenticated}>
                  {isAuthenticated ? `Authenticated as ${walletAddress}` : 'Not authenticated'}
                </p>
              </div>

              {tokenData.expiresAt && (
                <div className={tokenData.expiresAt > Date.now() ? styles.tokenValid : styles.tokenExpired}>
                  <h4 className="font-medium">Token Status</h4>
                  <p>
                    {tokenData.expiresAt > Date.now()
                      ? `Token valid, expires in ${countdownTime}`
                      : 'Token expired, please refresh'}
                  </p>
                </div>
              )}

              <div className={styles.buttonContainer}>
                <Button onClick={testAuthentication} disabled={isLoading} className={styles.button}>
                  {isLoading ? 'Testing...' : 'Test Authentication'}
                </Button>
                <Button
                  onClick={testRefreshToken}
                  disabled={isLoading || !isAuthenticated}
                  variant="outline"
                  className={styles.button}
                >
                  Refresh Token
                </Button>
                <Button
                  onClick={testRevokeSession}
                  disabled={isLoading || !isAuthenticated}
                  variant="destructive"
                  className={styles.button}
                >
                  Sign Out
                </Button>
              </div>

              {testResult && (
                <div className={styles.resultContainer}>
                  <div className="font-medium bg-slate-50 p-3 border-b border-slate-200">Test Result</div>
                  <pre className={styles.resultPre}>{testResult}</pre>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="token" className={styles.tabContent}>
            <div className="space-y-4">
              <div className={styles.inputGroup}>
                <Label htmlFor="token-exp" className="font-medium text-slate-600 mb-1 block">
                  Token Expiration
                </Label>
                <Input
                  id="token-exp"
                  value={tokenData.expiresAt ? new Date(tokenData.expiresAt).toLocaleString() : 'No token'}
                  readOnly
                />
              </div>

              <div className={styles.inputGroup}>
                <Label htmlFor="time-left" className="font-medium text-slate-600 mb-1 block">
                  Time Remaining
                </Label>
                <Input id="time-left" value={countdownTime || 'No token'} readOnly />
              </div>

              <div className={styles.inputGroup}>
                <Label htmlFor="refresh-token" className="font-medium text-slate-600 mb-1 block">
                  Refresh Token
                </Label>
                <Input id="refresh-token" value="Refresh tokens are managed internally by the auth system" readOnly />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
