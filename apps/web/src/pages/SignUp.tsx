import { useEffect, useState } from 'react';
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
import { Shield, Loader2, CheckCircle, UserPlus } from 'lucide-react';

export default function SignUp() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { isAuthenticated, signOut } = useAuth();
  const { address: didAddress, did, roles, isLoading: didLoading } = useDidSiwe();
  const { data: existingDid, isLoading: didCheckLoading } = useAddressToDID(address);
  
  const [didCheckComplete, setDidCheckComplete] = useState(false);
  const [shouldRedirectToLogin, setShouldRedirectToLogin] = useState(false);

  // Check if user is already fully authenticated
  useEffect(() => {
    if (isAuthenticated && didAddress && did && roles.length > 0) {
      toast.success('You are already signed in! Redirecting to dashboard...');
      navigate('/');
    }
  }, [isAuthenticated, didAddress, did, roles, navigate]);

  // Check if user has existing DID when wallet connects (only check at first step)
  useEffect(() => {
    // Only check DID status immediately after wallet connection, not during the flow
    if (isConnected && address && !didCheckLoading && !didCheckComplete) {
      setDidCheckComplete(true);
      
      // If user has existing DID, they should use login instead of signup
      if (existingDid && existingDid !== '') {
        setShouldRedirectToLogin(true);
        toast.info('You already have an account. Redirecting to login...');
        // Redirect to login page instead of continuing with signup
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
        return;
      }
      
      // User doesn't have DID, continue with signup flow
      setShouldRedirectToLogin(false);
    }
  }, [isConnected, address, existingDid, didCheckLoading, didCheckComplete, navigate]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <Card className="w-full max-w-lg p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200 dark:border-slate-700 shadow-2xl">
          <div className="text-center space-y-8">
            {/* Logo and Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 shadow-lg">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-white dark:border-slate-900" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Join DocuVault
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">
                  Create your secure digital identity
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4 text-left">
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Decentralized Identity</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Own and control your digital identity</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Secure Document Storage</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Blockchain-verified document integrity</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Privacy First</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">You control who accesses your documents</p>
                </div>
              </div>
            </div>

            {/* Connect Button */}
            <div className="space-y-4">
              <ConnectKitButton.Custom>
                {({ isConnecting, show }) => {
                  return (
                    <Button
                      onClick={show}
                      disabled={isConnecting}
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5 mr-2" />
                          Connect Wallet to Sign Up
                        </>
                      )}
                    </Button>
                  );
                }}
              </ConnectKitButton.Custom>
              
              <p className="text-sm text-slate-500 dark:text-slate-400">
                New to crypto?{' '}
                <a 
                  href="https://ethereum.org/en/wallets/find-wallet/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Get a wallet
                </a>
              </p>
            </div>

            {/* Already have account */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary hover:underline"
                  onClick={() => navigate('/auth')}
                >
                  Sign in here
                </Button>
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isConnected && (didLoading || didCheckLoading || !didCheckComplete)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200 dark:border-slate-700 shadow-2xl">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 rounded-2xl border-4 border-primary/20 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  Checking account status...
                </p>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Verifying if you already have a DocuVault account
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Show redirect message if user has existing DID
  if (shouldRedirectToLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200 dark:border-slate-700 shadow-2xl">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Account Found!
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                You already have a DocuVault account. Redirecting you to sign in...
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Redirecting...</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white dark:border-slate-900" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Create Your DocuVault Account
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Secure, decentralized document management powered by blockchain
          </p>
          <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Wallet Connected • Ready to create account</span>
          </div>
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
