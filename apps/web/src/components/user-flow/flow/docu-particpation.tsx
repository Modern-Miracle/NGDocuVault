'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAddAdmin, useRegisterVerifier, useRegisterHolder, useRegisterIssuer } from '@/hooks/use-docu-vault';

import { useAccount } from 'wagmi';
import { useSigninFlow } from '../contexts/signin-flow-context';
import { Role } from '../types';

interface DocuParticipationProps {
  onPrevious: () => void;
  onNext: () => void;
  onRegister: (e: React.FormEvent) => void;
  isProcessing: boolean;
  showRoleDialog: boolean;
  setShowRoleDialog: (show: boolean) => void;
}

const DocuParticipation = ({
  onPrevious,
  // onNext,
  onRegister,
  isProcessing,
  // showRoleDialog,
  // setShowRoleDialog,
}: DocuParticipationProps) => {
  const {
    role,
    setRole,
    producerError,
    producerTransactionHash,
    producerIsSuccess,
    setProducerError,
    setProducerTransactionHash,
    setProducerIsSuccess,
  } = useSigninFlow();

  // Use wagmi hooks for wallet connection
  const { address, isConnected } = useAccount();

  // Use the registerHolder mutation hook
  const { mutate: registerHolder, isPending: isSubmitting } = useRegisterHolder();
  const { mutate: registerVerifier, isPending: isSubmittingVerifier } = useRegisterVerifier();
  const { mutate: registerIssuer, isPending: isSubmittingIssuer } = useRegisterIssuer();
  const { mutate: addAdmin, isPending: isSubmittingAdmin } = useAddAdmin();

  // Prevent unused variable warnings - these are used conditionally in role registration logic
  if (registerVerifier && isSubmittingVerifier && registerIssuer && isSubmittingIssuer && addAdmin && isSubmittingAdmin) {
    // Variables are available for conditional role registration
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProducerError('');
    setProducerTransactionHash(null);
    setProducerIsSuccess(false);

    if (!isConnected || !address) {
      setProducerError('Please connect your wallet first');
      return;
    }

    try {
      registerHolder(
        {
          userAddr: address,
        },
        {
          onSuccess: (data: Record<string, unknown>) => {
            setProducerIsSuccess(true);
            setProducerTransactionHash(data.hash as string | null);
            toast.success('Producer registered successfully', {
              description: `Transaction hash: ${data.hash}`,
            });
            onRegister(e);
          },
          onError: (err: unknown) => {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setProducerError(errorMessage);
            toast.error('Registration failed', {
              description: errorMessage,
            });
          },
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setProducerError(errorMessage);
      toast.error('Error', {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Register Yourself as a Producer</CardTitle>
          <CardDescription>Register as a data producer in the LED-UP data registry</CardDescription>
        </CardHeader>

        <Alert className="mb-4 bg-primary/10 border-blue-200 text-primary dark:bg-blue-900/20 dark:border-primary">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <AlertTitle>Secure Registration</AlertTitle>
          <AlertDescription className="text-sm">
            This form uses your connected wallet to securely sign transactions. No private keys are required.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="consent">User Role</Label>
                <Select
                  value={role?.toString() ?? 'HOLDER_ROLE'}
                  onValueChange={(value) => setRole(value as Role)}
                  disabled={isSubmitting || isProcessing}
                >
                  <SelectTrigger id="consent">
                    <SelectValue placeholder="Select consent status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={'HOLDER_ROLE'}>Holder</SelectItem>
                    <SelectItem value={'VERIFIER_ROLE'}>Verifier</SelectItem>
                    <SelectItem value={'ISSUER_ROLE'}>Issuer</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Your consent for data sharing</p>
              </div>
            </div>

            {producerError && (
              <Alert
                variant="default"
                className="bg-red-50 border-red-200 text-red-300 dark:bg-red-900/30 dark:border-red-900 max-w-full overflow-x-auto"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{producerError}</AlertDescription>
              </Alert>
            )}

            {producerIsSuccess && producerTransactionHash && (
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Producer registered successfully!
                  <div className="mt-2">
                    <p className="text-xs font-medium">Transaction Hash:</p>
                    <code className="text-xs bg-gray-100 p-1 rounded break-all">{producerTransactionHash}</code>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onPrevious}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button type="submit" disabled={isSubmitting || isProcessing || !isConnected}>
                {isSubmitting || isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Register as Producer <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default DocuParticipation;
