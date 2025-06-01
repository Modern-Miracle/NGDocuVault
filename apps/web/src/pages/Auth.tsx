import { ConnectKitButton } from 'connectkit';
import { SIWEButton } from '@/components/auth/SIWEButton';
import { AuthStatus } from '@/components/auth/AuthStatus';
import { UserProfile } from '@/components/auth/UserProfile';
import { useAuth } from '@/hooks/use-auth';
import { useDidSiwe } from '@/hooks/use-did-siwe';
import { useNavigate } from 'react-router-dom';

function AuthPage() {
  const { isAuthenticated, error } = useAuth();
  const { isSignedIn } = useDidSiwe();
  console.log(isAuthenticated, ' isAuthenticated');
  console.log(isSignedIn, ' isSignedIn');
  console.log('condition', isAuthenticated && isSignedIn);
  const navigate = useNavigate();

  if (isAuthenticated && isSignedIn) {
    navigate('/');
  }
  return (
    <div className="max-w-4xl mx-auto p-6 mt-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Sign In with Ethereum</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Authentication</h2>

            {/* Connection Status */}
            <AuthStatus className="mb-4" />

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-md mb-4">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Connection Action */}
            <div className="flex flex-col gap-4 mt-6">
              {!isAuthenticated && (
                <div className="text-center flex flex-col items-center justify-center">
                  <ConnectKitButton />
                  <p className="mt-2 text-sm text-gray-500">Connect your wallet to continue</p>
                </div>
              )}

              {!isAuthenticated && !isSignedIn && (
                <div className="text-center">
                  <SIWEButton className="w-full" />
                  <p className="mt-2 text-sm text-gray-500">Sign a message to authenticate with your wallet</p>
                </div>
              )}

              {isAuthenticated && isSignedIn && (
                <div className="text-center">
                  <SIWEButton className="w-full" />
                  <p className="mt-2 text-sm text-gray-500">You're authenticated! You can sign out when done.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">What is Sign-In with Ethereum?</h2>
            <p className="text-gray-600">
              Sign-In with Ethereum (SIWE) allows you to use your Ethereum account to authenticate securely without
              relying on a centralized identity provider. By signing a message with your wallet, you can prove ownership
              of your address without sharing your private keys.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* User Profile - Only show if authenticated and signed in */}
          {isAuthenticated && isSignedIn ? (
            <UserProfile />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 h-full flex items-center justify-center">
              <p className="text-gray-500 text-center">
                Connect your wallet and sign in to view your profile information.
              </p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Benefits of SIWE</h2>
            <ul className="space-y-2 text-gray-600 list-disc pl-5">
              <li>Self-sovereign identity - you control your own data</li>
              <li>No password needed - use your crypto wallet</li>
              <li>Access to DID authentication and credentials</li>
              <li>Seamless integration with blockchain applications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
