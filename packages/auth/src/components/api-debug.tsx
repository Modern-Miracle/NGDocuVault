'use client';

import { useState } from 'react';
import { Button } from '@docu/ui/components/button';
import { Card, CardHeader, CardTitle, CardContent } from '@docu/ui/components/card';
import { Input } from '@docu/ui/components/input';
import { Label } from '@docu/ui/components/label';
import { ethers } from 'ethers';
import { generateSiweNonce, verifySiweSignature, refreshAuthToken } from '@docu/auth/actions/wallet-api';
import { useWalletAuth } from '@docu/auth/hooks/use-wallet-auth';
import styles from './api-debug.module.css';

// API base URL (for display purposes only, actual API calls use server actions)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7071';

// Type definition for refresh auth result
interface RefreshAuthResult {
  success: boolean;
  error?: string;
  expiresAt?: number;
}

// Avoid redefining window.ethereum interface
declare global {
  interface Window {
    ethereum?: any;
  }
}

export function ApiDebug() {
  const [address, setAddress] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshAuth } = useWalletAuth();

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toISOString().split('T')[1]?.split('.')[0] || ''} - ${message}`]);
  };

  // Connect to wallet
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      addLog('Connecting to wallet...');

      if (!window.ethereum) {
        addLog('❌ No wallet detected. Please install MetaMask.');
        return;
      }

      // Request accounts
      const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[];
      const walletAddress = accounts[0];

      if (!walletAddress) {
        addLog('❌ No accounts found. Please connect your wallet first.');
        return;
      }

      setAddress(walletAddress);
      addLog(`✅ Connected to wallet: ${walletAddress}`);
    } catch (error) {
      console.error('Connect wallet error:', error);
      addLog(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Request SIWE nonce
  const requestNonce = async () => {
    if (!address) {
      addLog('❌ Please connect to a wallet first');
      return;
    }

    try {
      setIsLoading(true);
      addLog(`Requesting SIWE nonce for address: ${address}`);

      const nonceResult = await generateSiweNonce(address);

      // Wait a brief moment to simulate network latency
      addLog(`Waiting for nonce to be processed...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage(nonceResult.message);
      addLog(`✅ Received SIWE message to sign`);
      addLog(`📝 Message: ${nonceResult.message}`);
      addLog(`⏱️ Expires at: ${new Date(nonceResult.expiresAt).toLocaleString()}`);
    } catch (error) {
      console.error('Nonce request error:', error);
      addLog(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign message
  const signMessage = async () => {
    if (!address || !message) {
      addLog('❌ Please connect wallet and request SIWE message first');
      return;
    }

    try {
      setIsLoading(true);
      addLog('Signing SIWE message...');

      // Check if window.ethereum is available
      if (!window.ethereum) {
        addLog('❌ No wallet detected. Please install MetaMask.');
        return;
      }

      // Request signature from wallet
      const sig = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      setSignature(sig as string);
      addLog(`✅ Message signed successfully`);
      addLog(`📝 Signature: ${sig}`);

      // Verify signature locally to ensure it's valid
      const recoveredAddress = ethers.verifyMessage(message, sig as string);

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        addLog(`❌ Signature verification failed locally`);
        return;
      }

      addLog(`✅ Signature verified locally: recovered address matches`);
    } catch (error) {
      console.error('Signature error:', error);
      addLog(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify signature with backend
  const verifySignature = async () => {
    if (!address || !signature || !message) {
      addLog('❌ Please complete all previous steps first');
      return;
    }

    try {
      setIsLoading(true);
      addLog('Verifying signature with backend...');

      try {
        // Verify signature with the backend
        const verifyResult = await verifySiweSignature(message, signature);

        addLog(`📥 Backend verification result: ${JSON.stringify(verifyResult, null, 2)}`);

        if (verifyResult.success) {
          addLog(`✅ Authentication successful!`);

          try {
            // Refresh auth session
            const refreshResult = await refreshAuth();

            // Safely handle refresh result
            if (refreshResult && refreshResult.success) {
              const expirationDate = refreshResult.expiresAt
                ? new Date(refreshResult.expiresAt).toLocaleString()
                : 'Unknown';
              addLog(`✅ Session established with expiration: ${expirationDate}`);
            } else {
              const errorMessage = refreshResult?.error || 'Unknown error';
              addLog(`⚠️ Session established but token refresh failed: ${errorMessage}`);
            }
          } catch (error) {
            addLog(`⚠️ Error refreshing session: ${error instanceof Error ? error.message : String(error)}`);
          }
        } else {
          addLog(`❌ Authentication failed: ${verifyResult.error || 'Unknown error'}`);
        }
      } catch (error) {
        addLog(`❌ Error during verification: ${error instanceof Error ? error.message : String(error)}`);
      }
    } catch (error) {
      console.error('Verification error:', error);
      addLog(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all data
  const clearAll = () => {
    setAddress('');
    setMessage('');
    setSignature('');
    setLogs([]);
  };

  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>SIWE Authentication Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={styles.container}>
          <div className={styles.inputsContainer}>
            <div className={styles.inputGrid}>
              <div className="col-span-3">
                <Label htmlFor="address">Wallet Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="0x..."
                  className={styles.inputField}
                  readOnly
                />
              </div>
              <Button onClick={connectWallet} disabled={isLoading} className="col-span-1">
                Connect Wallet
              </Button>
            </div>

            <div className={styles.inputGrid}>
              <div className="col-span-3">
                <Label htmlFor="message">SIWE Message</Label>
                <Input id="message" value={message} className={styles.inputField} readOnly />
              </div>
              <Button onClick={requestNonce} disabled={isLoading || !address} className="col-span-1">
                Request Message
              </Button>
            </div>

            <div className={styles.inputGrid}>
              <div className="col-span-3">
                <Label htmlFor="signature">Signature</Label>
                <Input id="signature" value={signature} className={styles.inputField} readOnly />
              </div>
              <Button onClick={signMessage} disabled={isLoading || !message} className="col-span-1">
                Sign Message
              </Button>
            </div>

            <div className={styles.buttonGroup}>
              <Button
                onClick={verifySignature}
                disabled={isLoading || !signature}
                className={styles.primaryButton}
                variant="default"
              >
                Verify Signature
              </Button>
              <Button onClick={clearAll} variant="destructive" className={styles.clearButton}>
                Clear
              </Button>
            </div>
          </div>

          <div className={styles.logsContainer}>
            <Label>Debug Logs</Label>
            <div className={styles.logsContent}>
              {logs.length === 0 ? (
                <p className={styles.logsPlaceholder}>No logs yet. Start the authentication process.</p>
              ) : (
                <pre className={styles.logsPre}>{logs.join('\n')}</pre>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
