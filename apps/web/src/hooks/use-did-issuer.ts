'use client';

/**
 * @file DID Issuer Hooks
 * @description This file contains all React Query hooks for the DID Issuer contract.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as didIssuerActions from '@/lib/actions/did-issuer';
import { useToast } from './use-toast';

/**
 * Query keys for the DID Issuer contract
 */
export const DID_ISSUER_KEYS = {
  all: ['did-issuer'] as const,
  credentialValid: (credentialId: string) => [...DID_ISSUER_KEYS.all, 'credentialValid', credentialId] as const,
};

// Query hooks

/**
 * Hook to check if a credential is valid
 * @param credentialId The credential ID to check
 * @returns Query result with the credential validity status
 */
export function useIsCredentialValid(credentialId?: string) {
  const { toast } = useToast();

  return useQuery({
    queryKey: DID_ISSUER_KEYS.credentialValid(credentialId || ''),
    queryFn: () => didIssuerActions.isCredentialValid(credentialId as string),
    enabled: !!credentialId,
    throwOnError: (error) => {
      toast.error('Failed to check credential validity', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      return false;
    },
  });
}

// Mutation hooks

/**
 * Hook to issue a credential
 * @returns Mutation result for issuing a credential
 */
export function useIssueCredentialIssuer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      credentialType,
      subject,
      credentialId,
      privateKey,
    }: {
      credentialType: string;
      subject: string;
      credentialId: string;
      privateKey: string;
    }) => {
      if (!privateKey) {
        throw new Error('Private key is required');
      }
      return didIssuerActions.issueCredentialIssuer(credentialType, subject, credentialId, privateKey);
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: DID_ISSUER_KEYS.credentialValid(variables.credentialId) });

      if (result.success) {
        toast.success('Credential issued successfully', {
          description: `Credential of type ${variables.credentialType} has been issued to ${variables.subject}`,
        });
      } else if (result.error) {
        toast.error('Failed to issue credential', {
          description: result.error,
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to issue credential', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });
}
