import { type Log, type Address, parseEventLogs } from 'viem';
import { DocuVaultABI } from '@docu/abi';

// Event type definitions
export interface IssuerRegisteredEvent {
  issuer: Address;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface AdminRegisteredEvent {
  admin: Address;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface VerifierAddedEvent {
  verifier: Address;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface UserRegisteredEvent {
  role: `0x${string}`;
  did: string;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface DocumentRegisteredEvent {
  documentId: `0x${string}`;
  issuer: Address;
  holder: Address;
  cid: string;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface DocumentVerifiedEvent {
  documentId: `0x${string}`;
  verifier: Address;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface DocumentBatchVerifiedEvent {
  documentIds: readonly `0x${string}`[];
  verifier: Address;
  totalVerified: bigint;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface IssuerDeactivatedEvent {
  issuer: Address;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface IssuerActivatedEvent {
  issuer: Address;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface DocumentSharedEvent {
  documentId: `0x${string}`;
  holder: Address;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface VerificationRequestedEvent {
  documentId: `0x${string}`;
  holder: Address;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface ConsentGrantedEvent {
  documentId: `0x${string}`;
  requester: Address;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface ConsentRevokedEvent {
  documentId: `0x${string}`;
  requester: Address;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface ShareRequestedEvent {
  documentId: `0x${string}`;
  requester: Address;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface DocumentUpdatedEvent {
  oldDocumentId: `0x${string}`;
  newDocumentId: `0x${string}`;
  issuer: Address;
  holder: Address;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

// Event parsing helpers
export function parseIssuerRegisteredEvent(log: Log): IssuerRegisteredEvent | null {
  try {
    const parsed = parseEventLogs({
      abi: DocuVaultABI,
      logs: [log],
      eventName: 'IssuerRegistered',
    })[0];

    if (!parsed) return null;

    const eventArgs = (parsed as unknown as { args: { issuer: Address; timestamp: bigint } }).args;

    return {
      issuer: eventArgs.issuer,
      timestamp: eventArgs.timestamp,
      blockNumber: parsed.blockNumber,
      transactionHash: parsed.transactionHash,
    };
  } catch (error) {
    console.error('Error parsing IssuerRegistered event:', error);
    return null;
  }
}

export function parseDocumentRegisteredEvent(log: Log): DocumentRegisteredEvent | null {
  try {
    const parsed = parseEventLogs({
      abi: DocuVaultABI,
      logs: [log],
      eventName: 'DocumentRegistered',
    })[0];

    if (!parsed) return null;

    const eventArgs = (
      parsed as unknown as {
        args: { documentId: `0x${string}`; issuer: Address; holder: Address; cid: string; timestamp: bigint };
      }
    ).args;

    return {
      documentId: eventArgs.documentId,
      issuer: eventArgs.issuer,
      holder: eventArgs.holder,
      cid: eventArgs.cid,
      timestamp: eventArgs.timestamp,
      blockNumber: parsed.blockNumber,
      transactionHash: parsed.transactionHash,
    };
  } catch (error) {
    console.error('Error parsing DocumentRegistered event:', error);
    return null;
  }
}

export function parseDocumentVerifiedEvent(log: Log): DocumentVerifiedEvent | null {
  try {
    const parsed = parseEventLogs({
      abi: DocuVaultABI,
      logs: [log],
      eventName: 'DocumentVerified',
    })[0];

    if (!parsed) return null;

    const eventArgs = (
      parsed as unknown as { args: { documentId: `0x${string}`; verifier: Address; timestamp: bigint } }
    ).args;

    return {
      documentId: eventArgs.documentId,
      verifier: eventArgs.verifier,
      timestamp: eventArgs.timestamp,
      blockNumber: parsed.blockNumber,
      transactionHash: parsed.transactionHash,
    };
  } catch (error) {
    console.error('Error parsing DocumentVerified event:', error);
    return null;
  }
}

export function parseDocumentBatchVerifiedEvent(log: Log): DocumentBatchVerifiedEvent | null {
  try {
    const parsed = parseEventLogs({
      abi: DocuVaultABI,
      logs: [log],
      eventName: 'DocumentBatchVerified',
    })[0];

    if (!parsed) return null;

    const eventArgs = (
      parsed as unknown as {
        args: { documentIds: readonly `0x${string}`[]; verifier: Address; totalVerified: bigint; timestamp: bigint };
      }
    ).args;

    return {
      documentIds: eventArgs.documentIds,
      verifier: eventArgs.verifier,
      totalVerified: eventArgs.totalVerified,
      timestamp: eventArgs.timestamp,
      blockNumber: parsed.blockNumber,
      transactionHash: parsed.transactionHash,
    };
  } catch (error) {
    console.error('Error parsing DocumentBatchVerified event:', error);
    return null;
  }
}

export function parseConsentGrantedEvent(log: Log): ConsentGrantedEvent | null {
  try {
    const parsed = parseEventLogs({
      abi: DocuVaultABI,
      logs: [log],
      eventName: 'ConsentGranted',
    })[0];

    if (!parsed) return null;

    const eventArgs = (
      parsed as unknown as { args: { documentId: `0x${string}`; requester: Address; timestamp: bigint } }
    ).args;

    return {
      documentId: eventArgs.documentId,
      requester: eventArgs.requester,
      timestamp: eventArgs.timestamp,
      blockNumber: parsed.blockNumber,
      transactionHash: parsed.transactionHash,
    };
  } catch (error) {
    console.error('Error parsing ConsentGranted event:', error);
    return null;
  }
}

export function parseConsentRevokedEvent(log: Log): ConsentRevokedEvent | null {
  try {
    const parsed = parseEventLogs({
      abi: DocuVaultABI,
      logs: [log],
      eventName: 'ConsentRevoked',
    })[0];

    if (!parsed) return null;

    const eventArgs = (
      parsed as unknown as { args: { documentId: `0x${string}`; requester: Address; timestamp: bigint } }
    ).args;

    return {
      documentId: eventArgs.documentId,
      requester: eventArgs.requester,
      timestamp: eventArgs.timestamp,
      blockNumber: parsed.blockNumber,
      transactionHash: parsed.transactionHash,
    };
  } catch (error) {
    console.error('Error parsing ConsentRevoked event:', error);
    return null;
  }
}

// Batch parsing helper
export function parseDocuVaultEvents(logs: Log[]) {
  const events = {
    issuerRegistered: [] as IssuerRegisteredEvent[],
    adminRegistered: [] as AdminRegisteredEvent[],
    verifierAdded: [] as VerifierAddedEvent[],
    userRegistered: [] as UserRegisteredEvent[],
    documentRegistered: [] as DocumentRegisteredEvent[],
    documentVerified: [] as DocumentVerifiedEvent[],
    documentBatchVerified: [] as DocumentBatchVerifiedEvent[],
    issuerDeactivated: [] as IssuerDeactivatedEvent[],
    issuerActivated: [] as IssuerActivatedEvent[],
    documentShared: [] as DocumentSharedEvent[],
    verificationRequested: [] as VerificationRequestedEvent[],
    consentGranted: [] as ConsentGrantedEvent[],
    consentRevoked: [] as ConsentRevokedEvent[],
    shareRequested: [] as ShareRequestedEvent[],
    documentUpdated: [] as DocumentUpdatedEvent[],
  };

  // Parse each log based on its signature
  for (const log of logs) {
    // Try parsing as each event type
    const issuerRegistered = parseIssuerRegisteredEvent(log);
    if (issuerRegistered) {
      events.issuerRegistered.push(issuerRegistered);
      continue;
    }

    const documentRegistered = parseDocumentRegisteredEvent(log);
    if (documentRegistered) {
      events.documentRegistered.push(documentRegistered);
      continue;
    }

    const documentVerified = parseDocumentVerifiedEvent(log);
    if (documentVerified) {
      events.documentVerified.push(documentVerified);
      continue;
    }

    const documentBatchVerified = parseDocumentBatchVerifiedEvent(log);
    if (documentBatchVerified) {
      events.documentBatchVerified.push(documentBatchVerified);
      continue;
    }

    const consentGranted = parseConsentGrantedEvent(log);
    if (consentGranted) {
      events.consentGranted.push(consentGranted);
      continue;
    }

    const consentRevoked = parseConsentRevokedEvent(log);
    if (consentRevoked) {
      events.consentRevoked.push(consentRevoked);
    }

    // Add other event parsers as needed
  }

  return events;
}

// Utility functions
export function filterDocumentsByHolder<T extends { holder: Address }>(events: T[], holder: Address): T[] {
  const normalizedHolder = holder.toLowerCase();
  return events.filter((event) => event.holder.toLowerCase() === normalizedHolder);
}

export function filterDocumentsByIssuer<T extends { issuer: Address }>(events: T[], issuer: Address): T[] {
  const normalizedIssuer = issuer.toLowerCase();
  return events.filter((event) => event.issuer.toLowerCase() === normalizedIssuer);
}

export function filterEventsByDocumentId<T extends { documentId: `0x${string}` }>(
  events: T[],
  documentId: `0x${string}`
): T[] {
  return events.filter((event) => event.documentId === documentId);
}

export function getDocumentHistory(
  registeredEvents: DocumentRegisteredEvent[],
  verifiedEvents: DocumentVerifiedEvent[],
  documentId: `0x${string}`
): {
  registration: DocumentRegisteredEvent | null;
  verifications: DocumentVerifiedEvent[];
} {
  const registration = registeredEvents.find((e) => e.documentId === documentId) || null;
  const verifications = verifiedEvents.filter((e) => e.documentId === documentId);

  return {
    registration,
    verifications: verifications.sort((a, b) => Number(a.blockNumber - b.blockNumber)),
  };
}

export function getConsentStatus(
  grantedEvents: ConsentGrantedEvent[],
  revokedEvents: ConsentRevokedEvent[],
  documentId: `0x${string}`,
  requester: Address
): boolean {
  // Get all events for this document and requester
  const granted = grantedEvents.filter(
    (e) => e.documentId === documentId && e.requester.toLowerCase() === requester.toLowerCase()
  );
  const revoked = revokedEvents.filter(
    (e) => e.documentId === documentId && e.requester.toLowerCase() === requester.toLowerCase()
  );

  // Find the latest event
  const allEvents = [...granted, ...revoked].sort((a, b) => Number(b.blockNumber - a.blockNumber));

  if (allEvents.length === 0) return false;

  // Check if the latest event is a grant
  const latestEvent = allEvents[0];
  return granted.includes(latestEvent as ConsentGrantedEvent);
}

export function getActiveConsents(
  grantedEvents: ConsentGrantedEvent[],
  revokedEvents: ConsentRevokedEvent[],
  documentId: `0x${string}`
): Address[] {
  const consentMap = new Map<string, boolean>();

  // Process all events in chronological order
  const allEvents = [
    ...grantedEvents.filter((e) => e.documentId === documentId).map((e) => ({ ...e, type: 'grant' as const })),
    ...revokedEvents.filter((e) => e.documentId === documentId).map((e) => ({ ...e, type: 'revoke' as const })),
  ].sort((a, b) => Number(a.blockNumber - b.blockNumber));

  for (const event of allEvents) {
    const requesterKey = event.requester.toLowerCase();
    consentMap.set(requesterKey, event.type === 'grant');
  }

  // Return only active consents
  return Array.from(consentMap.entries())
    .filter(([, isActive]) => isActive)
    .map(([requester]) => requester as Address);
}
