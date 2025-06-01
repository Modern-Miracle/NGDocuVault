import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { StepIndicator } from '../../step-indicator';
import { DidDocumentForm } from './did-document-form';
import { PrivateKeyDialog } from './private-key-dialog';
import { UserRoleDialog } from './user-role-dialog';
import { SIWEButton } from '../../auth/SIWEButton';
import { toast } from 'sonner';
import { useRegisterDid } from '../../../hooks/use-did-registry';
import { useAuth } from '../../../hooks/use-auth';
import { useSIWE } from '../../../components/providers/SIWEProvider';
import { useSigninFlow } from '../contexts/signin-flow-context';
import { generateKeyPair } from '../../../lib/crypto';
import { Loader2 } from 'lucide-react';
import { useGetDid } from '@/hooks/use-did-auth';
import { useAddressToDID } from '@/hooks/use-did-registry';
import { Role } from '../types';

interface DidCreationWrapperProps {
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

// Define the registration steps
const registrationSteps = [
  {
    id: '1',
    label: 'Connect Wallet',
    description: 'Connect your wallet to get started',
  },
  {
    id: '2',
    label: 'Configure & Register DID',
    description: 'Review, secure, and register your DID',
  },
  {
    id: '3',
    label: 'Select Role',
    description: 'Choose your role in DocuVault',
  },
];

export function DidCreationWrapper({ onComplete, onError }: DidCreationWrapperProps) {
  const { address, isConnected } = useAccount();
  const { isAuthenticated } = useAuth();
  const { signIn: siweSignIn, isLoading: siweLoading } = useSIWE();
  const { data: existingDid } = useGetDid(address as `0x${string}`);
  const { data: addressDid } = useAddressToDID(address);
  const didRegistryMutation = useRegisterDid();
  const flowContext = useSigninFlow();

  const [currentStep, setCurrentStep] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPrivateKeyDialog, setShowPrivateKeyDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [keyPair, setKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [hasExistingDid, setHasExistingDid] = useState(false);

  // Initialize key pair when component mounts
  useEffect(() => {
    if (!keyPair) {
      const newKeyPair = generateKeyPair();
      setKeyPair(newKeyPair);
      flowContext.setPublicKey(newKeyPair.publicKey);
      flowContext.setPrivateKey(newKeyPair.privateKey);
    }
  }, [keyPair, flowContext]);

  // Check if address already has a DID
  useEffect(() => {
    if (address && (existingDid || addressDid)) {
      const didExists = existingDid || addressDid;
      if (didExists && didExists !== '') {
        setHasExistingDid(true);
        // Set the existing DID in context
        flowContext.setDidIdentifier(didExists);
        flowContext.setDidCreated(true);

        // If user is already authenticated, redirect to complete
        if (isAuthenticated) {
          toast.success('You are already authenticated!');
          onComplete?.();
          return;
        }

        // If user has DID but not authenticated, skip to role selection
        toast.info('DID already exists. Proceeding to authentication...');
        setCurrentStep('3');
        setShowRoleDialog(true);
      }
    }
  }, [address, existingDid, addressDid, isAuthenticated, onComplete, flowContext]);

  // Move to step 2 when wallet is connected (only if no existing DID)
  useEffect(() => {
    if (isConnected && currentStep === '1' && !hasExistingDid) {
      setCurrentStep('2');
    }
  }, [isConnected, currentStep, hasExistingDid]);

  // Handle authentication using SIWE
  const handleAuthentication = async () => {
    if (!address) return;

    setIsProcessing(true);
    try {
      // Use SIWE sign in from the provider
      await siweSignIn();
      toast.success('Authentication successful!');
      onComplete?.();
    } catch (error) {
      console.error('Authentication error:', error);
      onError?.(error as Error);
      toast.error('Authentication failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle DID creation
  const handleDidCreation = async () => {
    if (!address || !flowContext.didDocument || !keyPair) return;

    // Check if DID already exists before attempting registration
    const didToCheck = `did:docuvault:${address}`;
    const existingDidForAddress = existingDid || addressDid;

    if (existingDidForAddress && existingDidForAddress !== '') {
      // DID already exists, skip registration and move to role selection
      flowContext.setDidIdentifier(existingDidForAddress);
      flowContext.setDidCreated(true);
      toast.info('DID already exists. Proceeding to role selection...');
      setCurrentStep('3');
      setShowRoleDialog(true);
      return;
    }

    setIsProcessing(true);
    flowContext.setIsProcessing(true);

    try {
      // Register DID using the hook
      await didRegistryMutation.mutateAsync({
        did: didToCheck,
        document: flowContext.didDocument,
        publicKey: keyPair.publicKey,
      });

      flowContext.setDidIdentifier(didToCheck);
      flowContext.setDidCreated(true);
      toast.success('DID created successfully!');

      // Move to role selection step
      setCurrentStep('3');
      setShowRoleDialog(true);
    } catch (error) {
      console.error('DID creation error:', error);

      // Check if error is about DID already being registered
      if (error instanceof Error && error.message.includes('already registered')) {
        // DID was registered in another session, treat as existing DID
        flowContext.setDidIdentifier(didToCheck);
        flowContext.setDidCreated(true);
        toast.info('DID already exists. Proceeding to role selection...');
        setCurrentStep('3');
        setShowRoleDialog(true);
      } else {
        onError?.(error as Error);
        toast.error('Failed to create DID');
      }
    } finally {
      setIsProcessing(false);
      flowContext.setIsProcessing(false);
    }
  };

  // Handle role selection
  const handleRoleSelection = async (role: string) => {
    flowContext.setRole(role as Role);
    setShowRoleDialog(false);

    // After role selection, authenticate the user using SIWE
    await handleAuthentication();
  };

  // Step 1: Wallet Connection
  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>To get started with DocuVault, please connect your wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <StepIndicator steps={registrationSteps} activeStep={parseInt(currentStep)} />
          <div className="mt-8 flex justify-center">
            <SIWEButton className="px-6 py-3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 2: DID Configuration
  if (currentStep === '2') {
    return (
      <>
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Configure Your DID</CardTitle>
            <CardDescription>Set up your Decentralized Identifier for secure document management</CardDescription>
          </CardHeader>
          <CardContent>
            <StepIndicator steps={registrationSteps} activeStep={parseInt(currentStep)} />
            <div className="mt-8">
              <DidDocumentForm
                didIdentifier={flowContext.didIdentifier || `did:docuvault:${address}`}
                publicKey={flowContext.publicKey}
                didDocument={flowContext.didDocument}
                isProcessing={isProcessing || siweLoading}
                onDidDocumentChange={(value) => flowContext.setDidDocument(value)}
                onCancel={() => setCurrentStep('1')}
                onSubmit={handleDidCreation}
                onShowPrivateKey={() => setShowPrivateKeyDialog(true)}
              />
            </div>
          </CardContent>
        </Card>

        <PrivateKeyDialog
          open={showPrivateKeyDialog}
          onOpenChange={setShowPrivateKeyDialog}
          privateKey={flowContext.privateKey}
          onCopyPrivateKey={() => {
            navigator.clipboard.writeText(flowContext.privateKey);
            toast.success('Private key copied to clipboard');
          }}
          onConfirm={() => {
            setShowPrivateKeyDialog(false);
            toast.success('Private key saved securely');
          }}
        />
      </>
    );
  }

  // Step 3: Role Selection
  if (currentStep === '3') {
    return (
      <>
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Select Your Role</CardTitle>
            <CardDescription>Choose your role in the DocuVault ecosystem</CardDescription>
          </CardHeader>
          <CardContent>
            <StepIndicator steps={registrationSteps} activeStep={parseInt(currentStep)} />
            {(isProcessing || siweLoading) && (
              <div className="mt-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>

        <UserRoleDialog
          isOpen={showRoleDialog}
          onClose={() => setShowRoleDialog(false)}
          onSelectRole={handleRoleSelection}
        />
      </>
    );
  }

  return null;
}
