import { useQuery } from '@tanstack/react-query';
import { usePublicClient, useBlockNumber } from 'wagmi';
import { type Address, type GetContractEventsParameters } from 'viem';
import { DidRegistryABI } from '@docu/abi';
import {
  parseDIDRegistryEvents,
  type DIDRegisteredEvent,
  type DIDUpdatedEvent,
  type DIDDeactivatedEvent,
  filterRegistryEventsByDID as filterEventsByDID,
  getLatestEvent,
} from '../../helpers/events';

/**
 * Base hook for fetching DID Registry contract events
 */
export function useDidRegistryEvents<TEventName extends string>({
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
  args?: GetContractEventsParameters<typeof DidRegistryABI, TEventName>['args'];
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}) {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ['didRegistryEvents', address, eventName, args, fromBlock, toBlock],
    queryFn: async () => {
      if (!publicClient) {
        throw new Error('Public client is not available');
      }

      return publicClient.getContractEvents({
        address,
        abi: DidRegistryABI,
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
 * Hook to fetch DIDRegistered events
 */
export function useDIDRegisteredEvents({
  address,
  did,
  controller,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  did?: string;
  controller?: Address;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  const args = {
    ...(did && { did }),
    ...(controller && { controller }),
  };

  return useDidRegistryEvents({
    address,
    eventName: 'DIDRegistered',
    args: Object.keys(args).length > 0 ? args : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch DIDUpdated events
 */
export function useDIDUpdatedEvents({
  address,
  did,
  timestamp,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  did?: string;
  timestamp?: bigint;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  const args = {
    ...(did && { did }),
    ...(timestamp && { timestamp }),
  };

  return useDidRegistryEvents({
    address,
    eventName: 'DIDUpdated',
    args: Object.keys(args).length > 0 ? args : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch DIDDeactivated events
 */
export function useDIDDeactivatedEvents({
  address,
  did,
  timestamp,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  did?: string;
  timestamp?: bigint;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  const args = {
    ...(did && { did }),
    ...(timestamp && { timestamp }),
  };

  return useDidRegistryEvents({
    address,
    eventName: 'DIDDeactivated',
    args: Object.keys(args).length > 0 ? args : undefined,
    fromBlock,
    toBlock,
    enabled,
  });
}

/**
 * Hook to fetch all DID events for a specific DID
 */
export function useDIDEvents({
  address,
  did,
  fromBlock,
  toBlock,
  enabled = true,
}: {
  address: Address;
  did: string;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  enabled?: boolean;
}) {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ['didEvents', address, did, fromBlock, toBlock],
    queryFn: async () => {
      if (!publicClient) {
        throw new Error('Public client is not available');
      }

      const logs = await publicClient.getLogs({
        address,
        fromBlock,
        toBlock,
      });

      const events = parseDIDRegistryEvents(logs);

      return {
        registered: filterEventsByDID(events.registered, did),
        updated: filterEventsByDID(events.updated, did),
        deactivated: filterEventsByDID(events.deactivated, did),
      };
    },
    enabled: enabled && !!publicClient && !!did,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });
}

/**
 * Hook to get the latest DID status
 */
export function useLatestDIDStatus({
  address,
  did,
  enabled = true,
}: {
  address: Address;
  did: string;
  enabled?: boolean;
}) {
  const { data: blockNumber } = useBlockNumber();
  const { data: events, isLoading } = useDIDEvents({
    address,
    did,
    fromBlock: 0n,
    toBlock: blockNumber,
    enabled: enabled && !!blockNumber,
  });

  const latestRegistered = events ? getLatestEvent(events.registered) : null;
  const latestUpdated = events ? getLatestEvent(events.updated) : null;
  const latestDeactivated = events ? getLatestEvent(events.deactivated) : null;

  // Determine current status
  let status: 'active' | 'deactivated' | 'not-registered' = 'not-registered';
  if (latestRegistered) {
    status = 'active';
    if (latestDeactivated && latestDeactivated.blockNumber > latestRegistered.blockNumber) {
      status = 'deactivated';
    }
  }

  return {
    status,
    latestRegistered,
    latestUpdated,
    latestDeactivated,
    isLoading,
  };
}

/**
 * Hook to watch for new DID events in real-time
 */
export function useWatchDIDEvents({
  address,
  did,
  onRegistered,
  onUpdated,
  onDeactivated,
  enabled = true,
}: {
  address: Address;
  did?: string;
  onRegistered?: (event: DIDRegisteredEvent) => void;
  onUpdated?: (event: DIDUpdatedEvent) => void;
  onDeactivated?: (event: DIDDeactivatedEvent) => void;
  enabled?: boolean;
}) {
  const publicClient = usePublicClient();

  useQuery({
    queryKey: ['watchDIDEvents', address, did],
    queryFn: async () => {
      if (!publicClient || !enabled) return null;

      const unwatch = publicClient.watchContractEvent({
        address,
        abi: DidRegistryABI,
        onLogs: (logs) => {
          const events = parseDIDRegistryEvents(logs);

          events.registered.forEach((event) => {
            if (!did || event.did.toLowerCase() === did.toLowerCase()) {
              onRegistered?.(event);
            }
          });

          events.updated.forEach((event) => {
            if (!did || event.did.toLowerCase() === did.toLowerCase()) {
              onUpdated?.(event);
            }
          });

          events.deactivated.forEach((event) => {
            if (!did || event.did.toLowerCase() === did.toLowerCase()) {
              onDeactivated?.(event);
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
