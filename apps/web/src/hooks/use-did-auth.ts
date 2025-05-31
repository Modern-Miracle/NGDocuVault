import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as didAuthActions from '@/lib/actions/did-auth';
import { useToast } from './use-toast';
import {
  getVerifierRole,
  getIssuerRole,
  getDefaultAdminRole,
  getAdminRole,
  isAdmin,
  isIssuer,
  isVerifier,
  isHolder,
} from '@/lib/actions/did-auth';

export const DID_AUTH_KEYS = {
  all: ['docuVault'] as const,
  role: {
    admin: (role?: string) => [...DID_AUTH_KEYS.all, 'role', 'admin', role] as const,
    check: (role?: string, account?: string) => [...DID_AUTH_KEYS.all, 'role', 'check', role, account] as const,
    adminRole: () => [...DID_AUTH_KEYS.all, 'role', 'adminRole'] as const,
    defaultAdminRole: () => [...DID_AUTH_KEYS.all, 'role', 'defaultAdminRole'] as const,
    issuerRole: () => [...DID_AUTH_KEYS.all, 'role', 'issuerRole'] as const,
    verifierRole: () => [...DID_AUTH_KEYS.all, 'role', 'verifierRole'] as const,
    isAdmin: (address?: string) => [...DID_AUTH_KEYS.all, 'role', 'isAdmin', address] as const,
    isIssuer: (address?: string) => [...DID_AUTH_KEYS.all, 'role', 'isIssuer', address] as const,
    isVerifier: (address?: string) => [...DID_AUTH_KEYS.all, 'role', 'isVerifier', address] as const,
    isHolder: (address?: string) => [...DID_AUTH_KEYS.all, 'role', 'isHolder', address] as const,
  },
} as const;

/**
 * Hook to authenticate a DID for a specific role
 * @param did - The DID to authenticate
 * @param role - The role to authenticate for
 */
export function useAuthenticate(did?: string, role?: string) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['didAuth', 'authenticate', did, role],
    queryFn: () => didAuthActions.authenticate(did!, role!),
    enabled: !!did && !!role,
    meta: {
      errorMessage: 'Authentication failed',
    },
    throwOnError: (error) => {
      toast.error('Authentication failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      return false;
    },
  });
}

/**
 * Hook to get the DID for an address
 * @param address - The address to get the DID for
 */
export function useGetDid(address?: `0x${string}`) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['didAuth', 'getDidFromAddress', address],
    queryFn: () => didAuthActions.getDid(address!),
    enabled: !!address,
    meta: {
      errorMessage: 'Failed to get DID',
    },
    throwOnError: (error) => {
      toast.error('Failed to get DID', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      return false;
    },
  });
}

/**
 * Hook to get the required credential for a role
 * @param role - The role to get the required credential for
 */
export function useRequiredCredentialForRole(role?: string) {
  return useQuery({
    queryKey: ['didAuth', 'getRequiredCredentialForRole', role],
    queryFn: () => didAuthActions.getRequiredCredentialForRole(role!),
    enabled: !!role,
  });
}

/**
 * Hook to check if a DID has the required roles and credentials
 * @param did - The DID to check
 * @param roles - The roles to check
 * @param credentialIds - The credential IDs to check
 */
export function useHasRequiredRolesAndCredentials(did?: string, roles?: string[], credentialIds?: string[]) {
  return useQuery({
    queryKey: ['didAuth', 'hasRequiredRolesAndCredentials', did, roles, credentialIds],
    queryFn: () => didAuthActions.hasRequiredRolesAndCredentials(did!, roles!, credentialIds!),
    enabled: !!did && !!roles && !!credentialIds,
  });
}

/**
 * Hook to verify a credential for an action
 * @param did - The DID to verify
 * @param credentialType - The credential type to verify
 * @param credentialId - The credential ID to verify
 */
export function useVerifyCredentialForAction(did?: string, credentialType?: string, credentialId?: string) {
  return useQuery({
    queryKey: ['didAuth', 'verifyCredentialForAction', did, credentialType, credentialId],
    queryFn: () => didAuthActions.verifyCredentialForAction(did!, credentialType!, credentialId!),
    enabled: !!did && !!credentialType && !!credentialId,
  });
}

/**
 * Hook to get the producer credential type
 */
export function useIssuerCredential() {
  return useQuery({
    queryKey: ['didAuth', 'getIssuerCredential'],
    queryFn: () => didAuthActions.getIssuerCredential(),
  });
}

/**
 * Hook to get the service provider credential type
 */
export function useVerifierCredential() {
  return useQuery({
    queryKey: ['didAuth', 'getVerifierCredential'],
    queryFn: () => didAuthActions.getVerifierCredential(),
  });
}

/**
 * Hook to get the DID issuer contract address
 */
export function useDidIssuerAddress() {
  return useQuery({
    queryKey: ['didAuth', 'getDidIssuerAddress'],
    queryFn: () => didAuthActions.getDidIssuerAddress(),
  });
}

/**
 * Hook to get the DID registry contract address
 */
export function useDidRegistryAddress() {
  return useQuery({
    queryKey: ['didAuth', 'getDidRegistryAddress'],
    queryFn: () => didAuthActions.getDidRegistryAddress(),
  });
}

/**
 * Hook to get the DID verifier contract address
 */
export function useDidVerifierAddress() {
  return useQuery({
    queryKey: ['didAuth', 'getDidVerifierAddress'],
    queryFn: () => didAuthActions.getDidVerifierAddress(),
  });
}

/**
 * Hook to get the caller's DID
 */
export function useCallerDid() {
  return useQuery({
    queryKey: ['didAuth', 'getCallerDid'],
    queryFn: () => didAuthActions.getCallerDid(),
  });
}

/**
 * Hook to resolve a DID to its controller address
 * @param did - The DID to resolve
 */
export function useResolveDid(did?: string) {
  return useQuery({
    queryKey: ['didAuth', 'resolveDid', did],
    queryFn: () => didAuthActions.resolveDidDocument(did!),
    enabled: !!did,
  });
}

/**
 * Hook to check if a DID has a specific role
 * @param did - The DID to check
 * @param role - The role to check
 */
export function useHasDidRole(did?: string, role?: string) {
  return useQuery({
    queryKey: ['didAuth', 'hasDidRole', did, role],
    queryFn: () => didAuthActions.hasDidRole(did!, role!),
    enabled: !!did && !!role,
  });
}

/**
 * Hook to check if an account has a specific role
 * @param role - The role to check
 * @param account - The account to check
 */
export function useHasRole(role?: string, account?: `0x${string}`) {
  return useQuery({
    queryKey: ['didAuth', 'hasRole', role, account],
    queryFn: () => didAuthActions.hasRole(role!, account!),
    enabled: !!role && !!account,
  });
}

/**
 * Hook to check if an issuer is trusted for a credential type
 * @param credentialType - The credential type to check
 * @param issuer - The issuer address to check
 */
export function useIsTrustedIssuer(credentialType?: string, issuer?: `0x${string}`) {
  return useQuery({
    queryKey: ['didAuth', 'isTrustedIssuer', credentialType, issuer],
    queryFn: () => didAuthActions.isTrustedIssuer(credentialType!, issuer!),
    enabled: !!credentialType && !!issuer,
  });
}

/**
 * Hook to grant a role to a DID
 */
export function useGrantDidRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ did, role }: { did: string; role: string }) => didAuthActions.grantDidRole(did, role),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['didAuth'] });
      if (result.success) {
        toast.success('Role granted successfully', {
          description: `Role ${variables.role} has been granted to ${variables.did}`,
        });
      } else if (result.error) {
        toast.error('Failed to grant role', {
          description: result.error,
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to grant role', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });
}

/**
 * Hook to revoke a role from a DID
 */
export function useRevokeDidRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ did, role }: { did: string; role: string }) => didAuthActions.revokeDidRole(did, role),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['didAuth'] });
      if (result.success) {
        toast.success('Role revoked successfully', {
          description: `Role ${variables.role} has been revoked from ${variables.did}`,
        });
      } else if (result.error) {
        toast.error('Failed to revoke role', {
          description: result.error,
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to revoke role', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });
}

/**
 * Hook to set a trusted issuer for a credential type
 */
export function useSetTrustedIssuer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      credentialType,
      issuer,
      trusted,
    }: {
      credentialType: string;
      issuer: `0x${string}`;
      trusted: boolean;
    }) => didAuthActions.setTrustedIssuer(credentialType, issuer, trusted),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['didAuth'] });
      if (result.success) {
        toast.success(`Issuer ${variables.trusted ? 'trusted' : 'untrusted'} successfully`, {
          description: `Issuer ${variables.issuer} is now ${variables.trusted ? 'trusted' : 'untrusted'} for ${variables.credentialType}`,
        });
      } else if (result.error) {
        toast.error('Failed to update issuer trust status', {
          description: result.error,
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to update issuer trust status', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });
}

/**
 * Hook to set the credential requirement for a role
 */
export function useSetRoleRequirement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ role, requirement }: { role: string; requirement: string }) =>
      didAuthActions.setRoleRequirement(role, requirement),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['didAuth'] });
      if (result.success) {
        toast.success('Role requirement set successfully', {
          description: `Requirement ${variables.requirement} has been set for role ${variables.role}`,
        });
      } else if (result.error) {
        toast.error('Failed to set role requirement', {
          description: result.error,
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to set role requirement', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });
}

/**
 * Hook to issue a credential to a DID
 */
export function useIssueCredential() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      credentialType,
      did,
      credentialId,
    }: {
      credentialType: string;
      did: string;
      credentialId: string;
    }) => didAuthActions.issueCredential(credentialType, did, credentialId),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['didAuth'] });
      if (result.success) {
        toast.success('Credential issued successfully', {
          description: `Credential of type ${variables.credentialType} has been issued to ${variables.did}`,
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

/**
 * Hook to get all roles assigned to a DID
 * @param did - The DID to get roles for
 */
export function useUserRoles(did?: string) {
  return useQuery<`0x${string}`[], Error>({
    queryKey: ['didAuth', 'getUserRoles', did],
    queryFn: () => didAuthActions.getUserRoles(did!),
    enabled: !!did,
  });
}

/**
 * Hook to get all roles assigned to an address
 * @param address - The address to get roles for
 */
export function useUserRolesByAddress(address?: `0x${string}`) {
  return useQuery<`0x${string}`[], Error>({
    queryKey: ['didAuth', 'getUserRolesByAddress', address],
    queryFn: () => didAuthActions.getUserRolesByAddress(address!),
    enabled: !!address,
  });
}

/**
 * Hook to check if address is an admin
 * @param address - Address to check
 * @param config - Optional contract configuration
 */
export function useIsAdmin(address?: string) {
  return useQuery({
    queryKey: DID_AUTH_KEYS.role.isAdmin(address),
    queryFn: async () => {
      if (!address) {
        return Promise.reject(new Error('Address is required'));
      }
      return await isAdmin(address);
    },
    enabled: !!address,
  });
}

/**
 * Hook to check if address is an issuer
 * @param address - Address to check
 * @param config - Optional contract configuration
 */
export function useIsIssuer(address?: string) {
  return useQuery({
    queryKey: DID_AUTH_KEYS.role.isIssuer(address),
    queryFn: async () => {
      if (!address) {
        return Promise.reject(new Error('Address is required'));
      }
      return await isIssuer(address);
    },
    enabled: !!address,
  });
}

/**
 * Hook to check if address is a verifier
 * @param address - Address to check
 * @param config - Optional contract configuration
 */
export function useIsVerifier(address?: string) {
  return useQuery({
    queryKey: DID_AUTH_KEYS.role.isVerifier(address),
    queryFn: async () => {
      if (!address) {
        return Promise.reject(new Error('Address is required'));
      }
      return await isVerifier(address);
    },
    enabled: !!address,
  });
}

/**
 * Hook to check if address is a holder
 * @param address - Address to check
 * @param config - Optional contract configuration
 */
export function useIsHolder(address?: string) {
  return useQuery({
    queryKey: DID_AUTH_KEYS.role.isHolder(address),
    queryFn: async () => {
      if (!address) {
        return Promise.reject(new Error('Address is required'));
      }
      return await isHolder(address);
    },
    enabled: !!address,
  });
}

/**
 * Hook to get admin role constant
 * @param config - Optional contract configuration
 */
export function useAdminRole() {
  return useQuery({
    queryKey: DID_AUTH_KEYS.role.adminRole(),
    queryFn: () => getAdminRole(),
  });
}

/**
 * Hook to get default admin role constant
 * @param config - Optional contract configuration
 */
export function useDefaultAdminRole() {
  return useQuery({
    queryKey: DID_AUTH_KEYS.role.defaultAdminRole(),
    queryFn: () => getDefaultAdminRole(),
  });
}

/**
 * Hook to get issuer role constant
 * @param config - Optional contract configuration
 */
export function useIssuerRole() {
  return useQuery({
    queryKey: DID_AUTH_KEYS.role.issuerRole(),
    queryFn: () => getIssuerRole(),
  });
}

/**
 * Hook to get verifier role constant
 * @param config - Optional contract configuration
 */
export function useVerifierRole() {
  return useQuery({
    queryKey: DID_AUTH_KEYS.role.verifierRole(),
    queryFn: () => getVerifierRole(),
  });
}

/**
 * Hook to check if an address has various roles
 * @param address - Address to check roles for
 * @param config - Optional contract configuration
 */
export function useRoles(address?: string) {
  const isAdminQuery = useIsAdmin(address);
  const isIssuerQuery = useIsIssuer(address);
  const isVerifierQuery = useIsVerifier(address);
  const isHolderQuery = useIsHolder(address);

  return {
    data: {
      isAdmin: isAdminQuery.data === true,
      isIssuer: isIssuerQuery.data === true,
      isVerifier: isVerifierQuery.data === true,
      isHolder: isHolderQuery.data === true,
    },
    isLoading:
      isAdminQuery.isLoading || isIssuerQuery.isLoading || isVerifierQuery.isLoading || isHolderQuery.isLoading,
    isError: isAdminQuery.isError || isIssuerQuery.isError || isVerifierQuery.isError || isHolderQuery.isError,
    error: isAdminQuery.error || isIssuerQuery.error || isVerifierQuery.error || isHolderQuery.error,
  };
}
