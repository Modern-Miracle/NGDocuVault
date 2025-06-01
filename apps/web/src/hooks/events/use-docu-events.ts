import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { type Address, type GetContractEventsParameters, type GetContractEventsReturnType } from 'viem';
import { DocuVaultABI } from '@docu/abi';

// Event name types derived from the ABI
type DocuVaultEventName =
  | 'DocumentRegistered'
  | 'DocumentVerified'
  | 'DocumentBatchVerified'
  | 'DocumentUpdated'
  | 'DocumentShared'
  | 'ShareRequested'
  | 'ConsentGranted'
  | 'ConsentRevoked'
  | 'VerificationRequested'
  | 'UserRegistered'
  | 'IssuerRegistered'
  | 'IssuerActivated'
  | 'IssuerDeactivated'
  | 'AdminRegistered'
  | 'VerifierAdded';

// Base hook for fetching contract events with proper typing
export function useDocuEvents<TEventName extends DocuVaultEventName>({
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
  args?: GetContractEventsParameters<typeof DocuVaultABI, TEventName>['args'];
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}) {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ['docuEvents', address, eventName, args, fromBlock, toBlock],
    queryFn: async (): Promise<GetContractEventsReturnType<typeof DocuVaultABI, TEventName>> => {
      if (!publicClient) {
        throw new Error('Public client is not available');
      }

      const events = await publicClient.getContractEvents({
        address,
        abi: DocuVaultABI,
        eventName,
        args,
        fromBlock,
        toBlock,
        strict: true, // Ensure strict typing for events
      });

      return events;
    },
    enabled: enabled && !!publicClient,
    staleTime,
    gcTime,
  });
}

// Document Events

/**
 * Hook to fetch DocumentRegistered events
 */
export function useDocumentRegisteredEvents({
  address,
  issuer,
  holder,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  issuer?: Address;
  holder?: Address;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  return useDocuEvents({
    address,
    eventName: 'DocumentRegistered',
    args:
      issuer || holder
        ? {
            ...(issuer && { issuer }),
            ...(holder && { holder }),
          }
        : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch DocumentVerified events
 */
export function useDocumentVerifiedEvents({
  address,
  documentId,
  verifier,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  documentId?: `0x${string}`;
  verifier?: Address;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  return useDocuEvents({
    address,
    eventName: 'DocumentVerified',
    args:
      documentId || verifier
        ? {
            ...(documentId && { documentId }),
            ...(verifier && { verifier }),
          }
        : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch DocumentBatchVerified events
 */
export function useDocumentBatchVerifiedEvents({
  address,
  documentIds,
  verifier,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  documentIds?: readonly `0x${string}`[];
  verifier?: Address;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  return useDocuEvents({
    address,
    eventName: 'DocumentBatchVerified',
    args:
      documentIds || verifier
        ? {
            ...(documentIds && { documentIds }),
            ...(verifier && { verifier }),
          }
        : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch DocumentUpdated events
 */
export function useDocumentUpdatedEvents({
  address,
  oldDocumentId,
  newDocumentId,
  issuer,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  oldDocumentId?: `0x${string}`;
  newDocumentId?: `0x${string}`;
  issuer?: Address;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  return useDocuEvents({
    address,
    eventName: 'DocumentUpdated',
    args:
      oldDocumentId || newDocumentId || issuer
        ? {
            ...(oldDocumentId && { oldDocumentId }),
            ...(newDocumentId && { newDocumentId }),
            ...(issuer && { issuer }),
          }
        : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch DocumentShared events
 */
export function useDocumentSharedEvents({
  address,
  documentId,
  holder,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  documentId?: `0x${string}`;
  holder?: Address;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  return useDocuEvents({
    address,
    eventName: 'DocumentShared',
    args:
      documentId || holder
        ? {
            ...(documentId && { documentId }),
            ...(holder && { holder }),
          }
        : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch ShareRequested events
 */
export function useShareRequestedEvents({
  address,
  documentId,
  requester,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  documentId?: `0x${string}`;
  requester?: Address;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  return useDocuEvents({
    address,
    eventName: 'ShareRequested',
    args:
      documentId || requester
        ? {
            ...(documentId && { documentId }),
            ...(requester && { requester }),
          }
        : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch ConsentGranted events
 */
export function useConsentGrantedEvents({
  address,
  documentId,
  requester,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  documentId?: `0x${string}`;
  requester?: Address;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  return useDocuEvents({
    address,
    eventName: 'ConsentGranted',
    args:
      documentId || requester
        ? {
            ...(documentId && { documentId }),
            ...(requester && { requester }),
          }
        : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch ConsentRevoked events
 */
export function useConsentRevokedEvents({
  address,
  documentId,
  requester,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  documentId?: `0x${string}`;
  requester?: Address;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  return useDocuEvents({
    address,
    eventName: 'ConsentRevoked',
    args:
      documentId || requester
        ? {
            ...(documentId && { documentId }),
            ...(requester && { requester }),
          }
        : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch VerificationRequested events
 */
export function useVerificationRequestedEvents({
  address,
  documentId,
  holder,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  documentId?: `0x${string}`;
  holder?: Address;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  return useDocuEvents({
    address,
    eventName: 'VerificationRequested',
    args:
      documentId || holder
        ? {
            ...(documentId && { documentId }),
            ...(holder && { holder }),
          }
        : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

// User Management Events

/**
 * Hook to fetch UserRegistered events
 */
export function useUserRegisteredEvents({
  address,
  role,
  did,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  role?: `0x${string}`;
  did?: string;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  return useDocuEvents({
    address,
    eventName: 'UserRegistered',
    args:
      role || did
        ? {
            ...(role && { role }),
            ...(did && { did }),
          }
        : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch IssuerRegistered events
 */
export function useIssuerRegisteredEvents({
  address,
  issuer,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  issuer?: Address;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  return useDocuEvents({
    address,
    eventName: 'IssuerRegistered',
    args: issuer ? { issuer } : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch IssuerActivated events
 */
export function useIssuerActivatedEvents({
  address,
  issuer,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  issuer?: Address;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  return useDocuEvents({
    address,
    eventName: 'IssuerActivated',
    args: issuer ? { issuer } : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch IssuerDeactivated events
 */
export function useIssuerDeactivatedEvents({
  address,
  issuer,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  issuer?: Address;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  return useDocuEvents({
    address,
    eventName: 'IssuerDeactivated',
    args: issuer ? { issuer } : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch AdminRegistered events
 */
export function useAdminRegisteredEvents({
  address,
  admin,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  admin?: Address;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  return useDocuEvents({
    address,
    eventName: 'AdminRegistered',
    args: admin ? { admin } : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch VerifierAdded events
 */
export function useVerifierAddedEvents({
  address,
  verifier,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  verifier?: Address;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  return useDocuEvents({
    address,
    eventName: 'VerifierAdded',
    args: verifier ? { verifier } : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}
