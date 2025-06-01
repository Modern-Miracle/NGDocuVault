import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { DidCreationWrapper } from '../components/user-flow/flow';
import { Card } from '../components/ui/card';
import { useAuth } from '../hooks/use-auth';
import { useDidSiwe } from '../hooks/use-did-siwe';
import { useAddressToDID } from '../hooks/use-did-registry';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { SigninFlowProvider } from '../components/user-flow/contexts/signin-flow-context';
import { ConnectKitButton } from 'connectkit';

export default function SignUp() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { isAuthenticated, signOut } = useAuth();
  const { address: didAddress, did, roles, isLoading: didLoading } = useDidSiwe();
  const { data: existingDid, isLoading: didCheckLoading } = useAddressToDID(address);

  // Check authentication and DID status
  useEffect(() => {
    if (isAuthenticated && didAddress && did && roles.length > 0) {
      toast.success('Authentication complete! Redirecting to dashboard...');
      navigate('/');
    }
  }, [isAuthenticated, didAddress, did, roles, navigate]);

  // Check if user has existing DID and redirect accordingly
  useEffect(() => {
    if (isConnected && address && existingDid && existingDid !== '' && !didCheckLoading) {
      // User has existing DID, check if they're authenticated
      if (isAuthenticated) {
        toast.success('Welcome back! Redirecting to dashboard...');
        navigate('/');
      }
      // If not authenticated but has DID, the flow will handle SIWE authentication
    }
  }, [isConnected, address, existingDid, isAuthenticated, didCheckLoading, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleFlowComplete = () => {
    // The flow component handles the complete authentication process
    // After completion, the useEffect above will redirect to dashboard
    toast.success('Registration complete!');
  };

  const handleFlowError = (error: Error) => {
    console.error('Authentication flow error:', error);

    // Handle specific error cases
    if (error.message.includes('already registered')) {
      toast.info('DID already exists. Please sign in instead.');
      // The flow should handle this automatically now
    } else {
      toast.error(error.message || 'Authentication failed');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8">
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold">Sign In to DocuVault</h1>
            <p className="text-muted-foreground">
              Connect your wallet to get started with decentralized document management
            </p>
            <ConnectKitButton />
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">Please connect your wallet using the button in the header</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (didLoading || didCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Checking authentication status...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Welcome to DocuVault</h1>
          <p className="text-lg text-muted-foreground">
            Secure, decentralized document management powered by blockchain
          </p>
          {existingDid && existingDid !== '' && (
            <p className="text-sm text-primary mt-2">
              DID found for your address.{' '}
              {isAuthenticated ? 'You are authenticated.' : 'Please complete authentication.'}
            </p>
          )}
        </div>

        <SigninFlowProvider>
          <DidCreationWrapper onComplete={handleFlowComplete} onError={handleFlowError} />
        </SigninFlowProvider>

        {isAuthenticated && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={handleSignOut} className="text-sm">
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
