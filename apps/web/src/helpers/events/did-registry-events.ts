import { type Log, type Address, parseEventLogs, type GetLogsParameters } from 'viem';
import { DidRegistryABI } from '@docu/abi';

// Event type definitions
export interface DIDRegisteredEvent {
  did: string;
  controller: Address;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface DIDUpdatedEvent {
  did: string;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface DIDDeactivatedEvent {
  did: string;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

// Event parsing helpers
export function parseDIDRegisteredEvent(log: Log): DIDRegisteredEvent | null {
  try {
    const parsed = parseEventLogs({
      abi: DidRegistryABI,
      logs: [log],
      eventName: 'DIDRegistered',
    })[0];

    if (!parsed) return null;

    const eventArgs = (
      parsed as unknown as {
        args: {
          did: string;
          controller: Address;
          timestamp: bigint;
          blockNumber: bigint;
          transactionHash: `0x${string}`;
        };
      }
    ).args;

    return {
      did: eventArgs.did,
      controller: eventArgs.controller,
      timestamp: eventArgs.timestamp,
      blockNumber: eventArgs.blockNumber,
      transactionHash: eventArgs.transactionHash,
    };
  } catch (error) {
    console.error('Error parsing DIDRegistered event:', error);
    return null;
  }
}

export function parseDIDUpdatedEvent(log: Log): DIDUpdatedEvent | null {
  try {
    const parsed = parseEventLogs({
      abi: DidRegistryABI,
      logs: [log],
      eventName: 'DIDUpdated',
    })[0];

    if (!parsed) return null;

    const eventArgs = (
      parsed as unknown as {
        args: { did: string; timestamp: bigint; blockNumber: bigint; transactionHash: `0x${string}` };
      }
    ).args;

    return {
      did: eventArgs.did,
      timestamp: eventArgs.timestamp,
      blockNumber: eventArgs.blockNumber,
      transactionHash: eventArgs.transactionHash,
    };
  } catch (error) {
    console.error('Error parsing DIDUpdated event:', error);
    return null;
  }
}

export function parseDIDDeactivatedEvent(log: Log): DIDDeactivatedEvent | null {
  try {
    const parsed = parseEventLogs({
      abi: DidRegistryABI,
      logs: [log],
      eventName: 'DIDDeactivated',
    })[0];

    if (!parsed) return null;

    const eventArgs = (
      parsed as unknown as {
        args: { did: string; timestamp: bigint; blockNumber: bigint; transactionHash: `0x${string}` };
      }
    ).args;

    return {
      did: eventArgs.did,
      timestamp: eventArgs.timestamp,
      blockNumber: eventArgs.blockNumber,
      transactionHash: eventArgs.transactionHash,
    };
  } catch (error) {
    console.error('Error parsing DIDDeactivated event:', error);
    return null;
  }
}

// Batch parsing helpers
export function parseDIDRegistryEvents(logs: Log[]) {
  const events = {
    registered: [] as DIDRegisteredEvent[],
    updated: [] as DIDUpdatedEvent[],
    deactivated: [] as DIDDeactivatedEvent[],
  };

  for (const log of logs) {
    // Try parsing as each event type
    const registered = parseDIDRegisteredEvent(log);
    if (registered) {
      events.registered.push(registered);
      continue;
    }

    const updated = parseDIDUpdatedEvent(log);
    if (updated) {
      events.updated.push(updated);
      continue;
    }

    const deactivated = parseDIDDeactivatedEvent(log);
    if (deactivated) {
      events.deactivated.push(deactivated);
    }
  }

  return events;
}

// Event filter builders
export function buildDIDRegisteredFilter(params?: {
  controller?: Address;
  fromBlock?: bigint;
  toBlock?: bigint;
}): Partial<GetLogsParameters> {
  return {
    fromBlock: params?.fromBlock,
    toBlock: params?.toBlock,
  };
}

export function buildDIDEventFilter(params?: {
  did?: string;
  fromBlock?: bigint;
  toBlock?: bigint;
}): Partial<GetLogsParameters> {
  return {
    fromBlock: params?.fromBlock,
    toBlock: params?.toBlock,
    // Note: DID is not indexed in events, so we'll need to filter client-side
  };
}

// Utility functions
export function sortEventsByBlock<T extends { blockNumber: bigint }>(events: T[], order: 'asc' | 'desc' = 'desc'): T[] {
  return [...events].sort((a, b) => {
    const diff = Number(a.blockNumber - b.blockNumber);
    return order === 'asc' ? diff : -diff;
  });
}

export function filterEventsByDID<T extends { did: string }>(events: T[], did: string): T[] {
  const normalizedDID = did.toLowerCase();
  return events.filter((event) => event.did.toLowerCase() === normalizedDID);
}

export function getLatestEvent<T extends { blockNumber: bigint }>(events: T[]): T | null {
  if (events.length === 0) return null;
  return events.reduce((latest, current) => (current.blockNumber > latest.blockNumber ? current : latest));
}
