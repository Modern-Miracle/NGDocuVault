import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { FileSignature, Loader2, WalletIcon, CheckCircle } from 'lucide-react';
import { useAccount, useConnect } from 'wagmi';
import { useSIWE } from '@/components/providers/SIWEProvider';
import { useAuth } from '@/hooks/use-auth';

const LoginPage: React.FC = () => {
  const location = useLocation();
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { signIn, isSignedIn, isLoading: siweLoading } = useSIWE();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [authStep, setAuthStep] = useState<'wallet' | 'siwe'>(isConnected ? 'siwe' : 'wallet');

  // Update step when wallet connects
  useEffect(() => {
    if (isConnected && authStep === 'wallet') {
      setAuthStep('siwe');
    }
  }, [isConnected, authStep]);

  // If already authenticated, redirect to the intended page or home
  if (isAuthenticated) {
    const from = location.state?.from || '/';
    return <Navigate to={from} replace />;
  }

  // Handle sign-in with Ethereum
  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('SIWE error:', error);
    }
  };

  const handleConnectWallet = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 bg-card rounded-xl shadow-lg border-border border">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <FileSignature className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-card-foreground">DocuVault</h1>
          <p className="mt-2 text-center text-muted-foreground">Secure document management on blockchain</p>
        </div>

        <div className="space-y-6">
          {/* Authentication Steps */}
          <div className="space-y-4">
            {/* Step 1: Connect Wallet */}
            <div
              className={`flex items-center p-4 rounded-lg border ${isConnected ? 'bg-success/10 border-success' : 'bg-card border-border'}`}
            >
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                {isConnected ? (
                  <CheckCircle className="w-6 h-6 text-success" />
                ) : (
                  <WalletIcon className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Connect Wallet</h3>
                {isConnected ? (
                  <p className="text-sm text-muted-foreground">
                    Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Connect your Ethereum wallet</p>
                )}
              </div>
              {!isConnected && (
                <button
                  onClick={handleConnectWallet}
                  className="ml-2 px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Connect
                </button>
              )}
            </div>

            {/* Step 2: Sign Message */}
            <div
              className={`flex items-center p-4 rounded-lg border ${isConnected ? 'border-primary' : 'border-muted opacity-50'} ${isSignedIn ? 'bg-success/10 border-success' : 'bg-card'}`}
            >
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                {isSignedIn ? (
                  <CheckCircle className="w-6 h-6 text-success" />
                ) : (
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    2
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Sign Message</h3>
                <p className="text-sm text-muted-foreground">
                  {isSignedIn ? 'Successfully authenticated' : 'Sign a message to verify your identity'}
                </p>
              </div>
              {isConnected && !isSignedIn && !siweLoading && (
                <button
                  onClick={handleSignIn}
                  className="ml-2 px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  disabled={!isConnected}
                >
                  Sign
                </button>
              )}
              {siweLoading && <Loader2 className="ml-2 w-5 h-5 animate-spin text-primary" />}
            </div>
          </div>

          {/* Loading state */}
          {(authLoading || siweLoading) && (
            <div className="flex items-center justify-center py-3 text-primary">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span>Authenticating...</span>
            </div>
          )}

          {/* Info box */}
          <div className="bg-accent rounded-lg p-4 text-sm text-accent-foreground mt-6">
            <p className="font-medium mb-1">Why connect your wallet?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Secure, decentralized document storage</li>
              <li>Immutable proof of authenticity</li>
              <li>Full control over your data and privacy</li>
              <li>Transparent verification process</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
