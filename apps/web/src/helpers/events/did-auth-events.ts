import { type Log, parseEventLogs } from 'viem';
import { DidAuthABI } from '@docu/abi';

// Event type definitions
export interface RoleGrantedEvent {
  did: string;
  role: `0x${string}`;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface RoleRevokedEvent {
  did: string;
  role: `0x${string}`;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface AuthenticationSuccessfulEvent {
  did: string;
  role: `0x${string}`;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface AuthenticationFailedEvent {
  did: string;
  role: `0x${string}`;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface CredentialVerifiedEvent {
  did: string;
  credentialType: string;
  credentialId: `0x${string}`;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface CredentialVerificationFailedEvent {
  did: string;
  credentialType: string;
  credentialId: `0x${string}`;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

// Role constants for convenience
export const ROLES = {
  DEFAULT_ADMIN: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
  ADMIN: '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775' as `0x${string}`,
  OPERATOR: '0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929' as `0x${string}`,
  ISSUER: '0x114e74f6ea3bd819998f78687bfcb11b140da08e9b7d222fa9c1f1ba1f2aa122' as `0x${string}`,
  VERIFIER: '0x22dba443fc5ad5bfa27a3a36949c784262145bd124cbf20bffe1258dc90e50c0' as `0x${string}`,
  HOLDER: '0x9831a676b7166f427a1ea7a5e5af3409d2fb5c10f36cbddfa8cf2521ec6e8a94' as `0x${string}`,
} as const;

// Reverse lookup for role names
export const ROLE_NAMES: Record<string, string> = {
  [ROLES.DEFAULT_ADMIN]: 'DEFAULT_ADMIN_ROLE',
  [ROLES.ADMIN]: 'ADMIN_ROLE',
  [ROLES.OPERATOR]: 'OPERATOR_ROLE',
  [ROLES.ISSUER]: 'ISSUER_ROLE',
  [ROLES.VERIFIER]: 'VERIFIER_ROLE',
  [ROLES.HOLDER]: 'HOLDER_ROLE',
};

// Event parsing helpers
export function parseRoleGrantedEvent(log: Log): RoleGrantedEvent | null {
  try {
    const parsed = parseEventLogs({
      abi: DidAuthABI,
      logs: [log],
      eventName: 'RoleGranted',
    })[0];

    if (!parsed) return null;

    const eventArgs = (parsed as unknown as { args: { did: string; role: `0x${string}`; timestamp: bigint } }).args;

    return {
      did: eventArgs.did,
      role: eventArgs.role,
      timestamp: eventArgs.timestamp,
      blockNumber: parsed.blockNumber,
      transactionHash: parsed.transactionHash,
    };
  } catch (error) {
    console.error('Error parsing RoleGranted event:', error);
    return null;
  }
}

export function parseRoleRevokedEvent(log: Log): RoleRevokedEvent | null {
  try {
    const parsed = parseEventLogs({
      abi: DidAuthABI,
      logs: [log],
      eventName: 'RoleRevoked',
    })[0];

    if (!parsed) return null;

    const eventArgs = (parsed as unknown as { args: { did: string; role: `0x${string}`; timestamp: bigint } }).args;

    return {
      did: eventArgs.did,
      role: eventArgs.role,
      timestamp: eventArgs.timestamp,
      blockNumber: parsed.blockNumber,
      transactionHash: parsed.transactionHash,
    };
  } catch (error) {
    console.error('Error parsing RoleRevoked event:', error);
    return null;
  }
}

export function parseAuthenticationSuccessfulEvent(log: Log): AuthenticationSuccessfulEvent | null {
  try {
    const parsed = parseEventLogs({
      abi: DidAuthABI,
      logs: [log],
      eventName: 'AuthenticationSuccessful',
    })[0];

    if (!parsed) return null;

    const eventArgs = (parsed as unknown as { args: { did: string; role: `0x${string}`; timestamp: bigint } }).args;

    return {
      did: eventArgs.did,
      role: eventArgs.role,
      timestamp: eventArgs.timestamp,
      blockNumber: parsed.blockNumber,
      transactionHash: parsed.transactionHash,
    };
  } catch (error) {
    console.error('Error parsing AuthenticationSuccessful event:', error);
    return null;
  }
}

export function parseAuthenticationFailedEvent(log: Log): AuthenticationFailedEvent | null {
  try {
    const parsed = parseEventLogs({
      abi: DidAuthABI,
      logs: [log],
      eventName: 'AuthenticationFailed',
    })[0];

    if (!parsed) return null;

    const eventArgs = (parsed as unknown as { args: { did: string; role: `0x${string}`; timestamp: bigint } }).args;

    return {
      did: eventArgs.did,
      role: eventArgs.role,
      timestamp: eventArgs.timestamp,
      blockNumber: parsed.blockNumber,
      transactionHash: parsed.transactionHash,
    };
  } catch (error) {
    console.error('Error parsing AuthenticationFailed event:', error);
    return null;
  }
}

export function parseCredentialVerifiedEvent(log: Log): CredentialVerifiedEvent | null {
  try {
    const parsed = parseEventLogs({
      abi: DidAuthABI,
      logs: [log],
      eventName: 'CredentialVerified',
    })[0];

    if (!parsed) return null;

    const eventArgs = (
      parsed as unknown as {
        args: { did: string; credentialType: string; credentialId: `0x${string}`; timestamp: bigint };
      }
    ).args;

    return {
      did: eventArgs.did,
      credentialType: eventArgs.credentialType,
      credentialId: eventArgs.credentialId,
      timestamp: eventArgs.timestamp,
      blockNumber: parsed.blockNumber,
      transactionHash: parsed.transactionHash,
    };
  } catch (error) {
    console.error('Error parsing CredentialVerified event:', error);
    return null;
  }
}

export function parseCredentialVerificationFailedEvent(log: Log): CredentialVerificationFailedEvent | null {
  try {
    const parsed = parseEventLogs({
      abi: DidAuthABI,
      logs: [log],
      eventName: 'CredentialVerificationFailed',
    })[0];

    if (!parsed) return null;

    const eventArgs = (
      parsed as unknown as {
        args: { did: string; credentialType: string; credentialId: `0x${string}`; timestamp: bigint };
      }
    ).args;

    return {
      did: eventArgs.did,
      credentialType: eventArgs.credentialType,
      credentialId: eventArgs.credentialId,
      timestamp: eventArgs.timestamp,
      blockNumber: parsed.blockNumber,
      transactionHash: parsed.transactionHash,
    };
  } catch (error) {
    console.error('Error parsing CredentialVerificationFailed event:', error);
    return null;
  }
}

// Batch parsing helpers
export function parseDidAuthEvents(logs: Log[]) {
  const events = {
    roleGranted: [] as RoleGrantedEvent[],
    roleRevoked: [] as RoleRevokedEvent[],
    authSuccessful: [] as AuthenticationSuccessfulEvent[],
    authFailed: [] as AuthenticationFailedEvent[],
    credentialVerified: [] as CredentialVerifiedEvent[],
    credentialVerificationFailed: [] as CredentialVerificationFailedEvent[],
  };

  for (const log of logs) {
    const roleGranted = parseRoleGrantedEvent(log);
    if (roleGranted) {
      events.roleGranted.push(roleGranted);
      continue;
    }

    const roleRevoked = parseRoleRevokedEvent(log);
    if (roleRevoked) {
      events.roleRevoked.push(roleRevoked);
      continue;
    }

    const authSuccessful = parseAuthenticationSuccessfulEvent(log);
    if (authSuccessful) {
      events.authSuccessful.push(authSuccessful);
      continue;
    }

    const authFailed = parseAuthenticationFailedEvent(log);
    if (authFailed) {
      events.authFailed.push(authFailed);
      continue;
    }

    const credentialVerified = parseCredentialVerifiedEvent(log);
    if (credentialVerified) {
      events.credentialVerified.push(credentialVerified);
      continue;
    }

    const credentialVerificationFailed = parseCredentialVerificationFailedEvent(log);
    if (credentialVerificationFailed) {
      events.credentialVerificationFailed.push(credentialVerificationFailed);
    }
  }

  return events;
}

// Utility functions
export function getRoleName(role: `0x${string}`): string {
  return ROLE_NAMES[role] || 'UNKNOWN_ROLE';
}

export function filterEventsByRole<T extends { role: `0x${string}` }>(events: T[], role: `0x${string}`): T[] {
  return events.filter((event) => event.role === role);
}

export function filterEventsByDID<T extends { did: string }>(events: T[], did: string): T[] {
  const normalizedDID = did.toLowerCase();
  return events.filter((event) => event.did.toLowerCase() === normalizedDID);
}

export function getCurrentRoles(
  grantedEvents: RoleGrantedEvent[],
  revokedEvents: RoleRevokedEvent[],
  did: string
): `0x${string}`[] {
  const normalizedDID = did.toLowerCase();
  const roleMap = new Map<`0x${string}`, boolean>();

  // Process all events in chronological order
  const allEvents = [
    ...grantedEvents.map((e) => ({ ...e, type: 'grant' as const })),
    ...revokedEvents.map((e) => ({ ...e, type: 'revoke' as const })),
  ].sort((a, b) => Number(a.blockNumber - b.blockNumber));

  for (const event of allEvents) {
    if (event.did.toLowerCase() === normalizedDID) {
      if (event.type === 'grant') {
        roleMap.set(event.role, true);
      } else {
        roleMap.set(event.role, false);
      }
    }
  }

  // Return only active roles
  return Array.from(roleMap.entries())
    .filter(([, isActive]) => isActive)
    .map(([role]) => role);
}

export function getAuthenticationHistory(
  successEvents: AuthenticationSuccessfulEvent[],
  failedEvents: AuthenticationFailedEvent[],
  did?: string
): Array<(AuthenticationSuccessfulEvent | AuthenticationFailedEvent) & { success: boolean }> {
  const history = [
    ...successEvents.map((e) => ({ ...e, success: true as const })),
    ...failedEvents.map((e) => ({ ...e, success: false as const })),
  ];

  if (did) {
    const normalizedDID = did.toLowerCase();
    return history
      .filter((event) => event.did.toLowerCase() === normalizedDID)
      .sort((a, b) => Number(b.blockNumber - a.blockNumber));
  }

  return history.sort((a, b) => Number(b.blockNumber - a.blockNumber));
}
