import { useQuery } from '@tanstack/react-query';
import { usePublicClient, useBlockNumber } from 'wagmi';
import { type Address, type GetContractEventsParameters } from 'viem';
import { DidAuthABI } from '@docu/abi';
import {
  parseDidAuthEvents,
  type RoleGrantedEvent,
  type RoleRevokedEvent,
  type AuthenticationSuccessfulEvent,
  type AuthenticationFailedEvent,
  ROLES,
  getRoleName,
  getCurrentRoles,
  getAuthenticationHistory,
} from '../../helpers/events';

/**
 * Base hook for fetching DID Authentication contract events
 */
function useDidAuthEvents<TEventName extends string>({
  address,
  eventName,
  args,
  fromBlock,
  toBlock,
  enabled = true,
  staleTime = 1000 * 60 * 5, // 5 minutes
  gcTime = 1000 * 60 * 60, // 1 hour
}: {
  address: Address;
  eventName: TEventName;
  args?: GetContractEventsParameters<typeof DidAuthABI, TEventName>['args'];
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}) {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ['didAuthEvents', address, eventName, args, fromBlock, toBlock],
    queryFn: async () => {
      if (!publicClient) {
        throw new Error('Public client is not available');
      }

      return publicClient.getContractEvents({
        address,
        abi: DidAuthABI,
        eventName,
        args,
        fromBlock,
        toBlock,
      });
    },
    enabled: enabled && !!publicClient,
    staleTime,
    gcTime,
  });
}

/**
 * Hook to fetch AuthenticationSuccessful events
 */
export function useAuthenticationSuccessfulEvents({
  address,
  did,
  role,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  did?: string;
  role?: `0x${string}`;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  const args = {
    ...(did && { did }),
    ...(role && { role }),
  };

  return useDidAuthEvents({
    address,
    eventName: 'AuthenticationSuccessful',
    args: Object.keys(args).length > 0 ? args : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch AuthenticationFailed events
 */
export function useAuthenticationFailedEvents({
  address,
  did,
  role,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  did?: string;
  role?: `0x${string}`;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  const args = {
    ...(did && { did }),
    ...(role && { role }),
  };

  return useDidAuthEvents({
    address,
    eventName: 'AuthenticationFailed',
    args: Object.keys(args).length > 0 ? args : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch CredentialVerified events
 */
export function useCredentialVerifiedEvents({
  address,
  did,
  credentialType,
  credentialId,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  did?: string;
  credentialType?: string;
  credentialId?: `0x${string}`;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  const args = {
    ...(did && { did }),
    ...(credentialType && { credentialType }),
    ...(credentialId && { credentialId }),
  };

  return useDidAuthEvents({
    address,
    eventName: 'CredentialVerified',
    args: Object.keys(args).length > 0 ? args : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch CredentialVerificationFailed events
 */
export function useCredentialVerificationFailedEvents({
  address,
  did,
  credentialType,
  credentialId,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  did?: string;
  credentialType?: string;
  credentialId?: `0x${string}`;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  const args = {
    ...(did && { did }),
    ...(credentialType && { credentialType }),
    ...(credentialId && { credentialId }),
  };

  return useDidAuthEvents({
    address,
    eventName: 'CredentialVerificationFailed',
    args: Object.keys(args).length > 0 ? args : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch RoleGranted events
 */
export function useRoleGrantedEvents({
  address,
  did,
  role,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  did?: string;
  role?: `0x${string}`;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  const args = {
    ...(did && { did }),
    ...(role && { role }),
  };

  return useDidAuthEvents({
    address,
    eventName: 'RoleGranted',
    args: Object.keys(args).length > 0 ? args : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch RoleRevoked events
 */
export function useRoleRevokedEvents({
  address,
  did,
  role,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  did?: string;
  role?: `0x${string}`;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  const args = {
    ...(did && { did }),
    ...(role && { role }),
  };

  return useDidAuthEvents({
    address,
    eventName: 'RoleRevoked',
    args: Object.keys(args).length > 0 ? args : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

// Export the base hook for custom queries
export { useDidAuthEvents };

/**
 * Hook to get current roles for a DID
 */
export function useCurrentDIDRoles({
  address,
  did,
  enabled = true,
}: {
  address: Address;
  did: string;
  enabled?: boolean;
}) {
  const { data: blockNumber } = useBlockNumber();

  const { data: grantedEvents } = useRoleGrantedEvents({
    address,
    did,
    fromBlock: 0n,
    toBlock: blockNumber,
    enabled: enabled && !!blockNumber,
  });

  const { data: revokedEvents } = useRoleRevokedEvents({
    address,
    did,
    fromBlock: 0n,
    toBlock: blockNumber,
    enabled: enabled && !!blockNumber,
  });

  const currentRoles =
    grantedEvents && revokedEvents
      ? getCurrentRoles(
          grantedEvents as unknown as RoleGrantedEvent[],
          revokedEvents as unknown as RoleRevokedEvent[],
          did
        )
      : [];

  const roleNames = currentRoles.map((role) => ({
    role,
    name: getRoleName(role),
  }));

  return {
    roles: currentRoles,
    roleNames,
    hasRole: (role: `0x${string}`) => currentRoles.includes(role),
    hasAdminRole: currentRoles.includes(ROLES.ADMIN) || currentRoles.includes(ROLES.DEFAULT_ADMIN),
    hasIssuerRole: currentRoles.includes(ROLES.ISSUER),
    hasVerifierRole: currentRoles.includes(ROLES.VERIFIER),
    hasHolderRole: currentRoles.includes(ROLES.HOLDER),
  };
}

/**
 * Hook to get authentication history for a DID
 */
export function useDIDAuthenticationHistory({
  address,
  did,
  limit = 100,
  enabled = true,
}: {
  address: Address;
  did?: string;
  limit?: number;
  enabled?: boolean;
}) {
  const { data: blockNumber } = useBlockNumber();

  const { data: successEvents } = useAuthenticationSuccessfulEvents({
    address,
    did,
    fromBlock: blockNumber ? blockNumber - BigInt(limit * 1000) : 0n,
    toBlock: blockNumber,
    enabled: enabled && !!blockNumber,
  });

  const { data: failedEvents } = useAuthenticationFailedEvents({
    address,
    did,
    fromBlock: blockNumber ? blockNumber - BigInt(limit * 1000) : 0n,
    toBlock: blockNumber,
    enabled: enabled && !!blockNumber,
  });

  const history =
    successEvents && failedEvents
      ? getAuthenticationHistory(
          successEvents as unknown as AuthenticationSuccessfulEvent[],
          failedEvents as unknown as AuthenticationFailedEvent[],
          did
        )
      : [];

  const stats = {
    totalAttempts: history.length,
    successCount: history.filter((h) => h.success).length,
    failureCount: history.filter((h) => !h.success).length,
    successRate: history.length > 0 ? (history.filter((h) => h.success).length / history.length) * 100 : 0,
  };

  return {
    history,
    stats,
    latestAttempt: history[0] || null,
  };
}

/**
 * Hook to watch for role changes
 */
export function useWatchRoleChanges({
  address,
  did,
  onRoleGranted,
  onRoleRevoked,
  enabled = true,
}: {
  address: Address;
  did?: string;
  onRoleGranted?: (event: RoleGrantedEvent) => void;
  onRoleRevoked?: (event: RoleRevokedEvent) => void;
  enabled?: boolean;
}) {
  const publicClient = usePublicClient();

  useQuery({
    queryKey: ['watchRoleChanges', address, did],
    queryFn: async () => {
      if (!publicClient || !enabled) return null;

      const unwatch = publicClient.watchContractEvent({
        address,
        abi: DidAuthABI,
        onLogs: (logs) => {
          const events = parseDidAuthEvents(logs);

          events.roleGranted.forEach((event) => {
            if (!did || event.did.toLowerCase() === did.toLowerCase()) {
              onRoleGranted?.(event);
            }
          });

          events.roleRevoked.forEach((event) => {
            if (!did || event.did.toLowerCase() === did.toLowerCase()) {
              onRoleRevoked?.(event);
            }
          });
        },
      });

      return unwatch;
    },
    enabled: enabled && !!publicClient,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/**
 * Hook to get all role events for analysis
 */
export function useRoleEventAnalytics({
  address,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ['roleEventAnalytics', address, fromBlock, toBlock],
    queryFn: async () => {
      if (!publicClient) {
        throw new Error('Public client is not available');
      }

      const logs = await publicClient.getLogs({
        address,
        fromBlock,
        toBlock,
      });

      const events = parseDidAuthEvents(logs);

      // Analyze role distribution
      const roleDistribution = new Map<`0x${string}`, number>();
      events.roleGranted.forEach((event) => {
        const count = roleDistribution.get(event.role) || 0;
        roleDistribution.set(event.role, count + 1);
      });

      // Analyze authentication patterns
      const authPatterns = {
        totalAuthentications: events.authSuccessful.length + events.authFailed.length,
        successfulAuthentications: events.authSuccessful.length,
        failedAuthentications: events.authFailed.length,
        successRate: (events.authSuccessful.length / (events.authSuccessful.length + events.authFailed.length)) * 100,
      };

      return {
        events,
        roleDistribution: Array.from(roleDistribution.entries()).map(([role, count]) => ({
          role,
          roleName: getRoleName(role),
          count,
        })),
        authPatterns,
        totalEvents: Object.values(events).reduce((sum, arr) => sum + arr.length, 0),
      };
    },
    enabled: enabled && !!publicClient,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

// Re-export constants for convenience
export { ROLES, ROLE_NAMES } from '../../helpers/events';
