import { createContext, ReactNode, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { type Log } from 'viem';
import { useDocumentInfo } from '@/hooks/use-docu-vault';
import { DocumentType } from '@/lib/actions/docu-vault/types';
import { CONTRACTS } from '@/config/contract';
import {
  useDocumentRegisteredEvents,
  useDocumentVerifiedEvents,
  useDocumentSharedEvents,
  useConsentGrantedEvents,
  useConsentRevokedEvents,
  useVerificationRequestedEvents,
  useShareRequestedEvents,
} from '@/hooks/events/use-docu-events';

// IPFS Data structure
interface IPFSDocumentData {
  name?: string;
  description?: string;
  document?: {
    documentType?: string;
    content?: string;
    fileName?: string;
    contentType?: string;
    fileSize?: number;
  };
}

// Parsed event interface with args property
interface ParsedEventLog extends Log {
  args?: {
    documentId?: string;
    timestamp?: bigint;
    issuer?: string;
    holder?: string;
    verifier?: string;
    requester?: string;
  };
}

// Event interface with proper typing
interface DocumentEvent extends Log {
  args?: {
    documentId?: string;
    timestamp?: bigint;
    issuer?: string;
    holder?: string;
    verifier?: string;
    requester?: string;
  };
  type: string;
  timestamp?: bigint;
  requester?: string;
}

interface DocumentDetailsContextValue {
  documentId: string;
  documentInfo:
    | {
        isVerified: boolean;
        isExpired: boolean;
        issuer: string;
        holder: string;
        issuanceDate: number;
        expirationDate: number;
        documentType: DocumentType;
      }
    | undefined;
  ipfsData: IPFSDocumentData | null;
  isLoading: boolean;
  error: Error | null;
  isHolder: boolean;
  isIssuer: boolean;
  events: DocumentEvent[];
  refetchAll: () => void;
}

export const DocumentDetailsContext = createContext<DocumentDetailsContextValue | undefined>(undefined);

interface DocumentDetailsProviderProps {
  children: ReactNode;
}

export function DocumentDetailsProvider({ children }: DocumentDetailsProviderProps) {
  const params = useParams<{ documentId?: string; id?: string }>();
  const { address } = useAccount();

  // Check both possible param names since routes might use either
  const documentId = params.documentId || params.id || '';

  // Contract address
  const contractAddress = CONTRACTS.DocuVault as `0x${string}`;

  // Fetch document info from blockchain - always call hooks
  const { data: documentInfoData, isLoading, error, refetch: refetchInfo } = useDocumentInfo(documentId);

  // Fetch document events - always call hooks
  const { data: documentRegisteredEvents } = useDocumentRegisteredEvents({
    address: contractAddress,
    enabled: !!documentId,
  });

  const { data: documentVerifiedEvents } = useDocumentVerifiedEvents({
    address: contractAddress,
    documentId: documentId as `0x${string}`,
    enabled: !!documentId,
  });

  const { data: documentSharedEvents } = useDocumentSharedEvents({
    address: contractAddress,
    documentId: documentId as `0x${string}`,
    enabled: !!documentId,
  });

  const { data: consentGrantedEvents } = useConsentGrantedEvents({
    address: contractAddress,
    documentId: documentId as `0x${string}`,
    enabled: !!documentId,
  });

  const { data: consentRevokedEvents } = useConsentRevokedEvents({
    address: contractAddress,
    documentId: documentId as `0x${string}`,
    enabled: !!documentId,
  });

  const { data: verificationRequestedEvents } = useVerificationRequestedEvents({
    address: contractAddress,
    documentId: documentId as `0x${string}`,
    enabled: !!documentId,
  });

  const { data: shareRequestedEvents } = useShareRequestedEvents({
    address: contractAddress,
    documentId: documentId as `0x${string}`,
    enabled: !!documentId,
  });

  // Transform document info to expected format
  const documentInfo = useMemo(() => {
    if (!documentInfoData) return undefined;
    return {
      isVerified: documentInfoData.isVerified,
      isExpired: documentInfoData.isExpired,
      issuer: documentInfoData.issuer,
      holder: documentInfoData.holder,
      issuanceDate: documentInfoData.issuanceDate,
      expirationDate: documentInfoData.expirationDate,
      documentType: documentInfoData.documentType,
    };
  }, [documentInfoData]);

  // For now, we'll just use null for IPFS data
  // TODO: Implement CID retrieval from backend or event parsing
  const ipfsData = null;

  // Combine and filter events for this document
  const events = useMemo(() => {
    const allEvents: DocumentEvent[] = [];

    // Add events with their types - use type assertion to access args
    documentRegisteredEvents?.forEach((event) => {
      const parsedEvent = event as ParsedEventLog;
      if (parsedEvent.args?.documentId === documentId) {
        allEvents.push({
          ...event,
          type: 'DocumentRegistered',
          timestamp: parsedEvent.args?.timestamp,
          args: parsedEvent.args,
        } as DocumentEvent);
      }
    });

    documentVerifiedEvents?.forEach((event) => {
      const parsedEvent = event as ParsedEventLog;
      allEvents.push({
        ...event,
        type: 'DocumentVerified',
        timestamp: parsedEvent.args?.timestamp,
        args: parsedEvent.args,
      } as DocumentEvent);
    });

    documentSharedEvents?.forEach((event) => {
      const parsedEvent = event as ParsedEventLog;
      allEvents.push({
        ...event,
        type: 'DocumentShared',
        timestamp: parsedEvent.args?.timestamp,
        args: parsedEvent.args,
      } as DocumentEvent);
    });

    consentGrantedEvents?.forEach((event) => {
      const parsedEvent = event as ParsedEventLog;
      allEvents.push({
        ...event,
        type: 'ConsentGranted',
        timestamp: parsedEvent.args?.timestamp,
        args: parsedEvent.args,
      } as DocumentEvent);
    });

    consentRevokedEvents?.forEach((event) => {
      const parsedEvent = event as ParsedEventLog;
      allEvents.push({
        ...event,
        type: 'ConsentRevoked',
        timestamp: parsedEvent.args?.timestamp,
        args: parsedEvent.args,
      } as DocumentEvent);
    });

    verificationRequestedEvents?.forEach((event) => {
      const parsedEvent = event as ParsedEventLog;
      allEvents.push({
        ...event,
        type: 'VerificationRequested',
        timestamp: parsedEvent.args?.timestamp,
        args: parsedEvent.args,
      } as DocumentEvent);
    });

    shareRequestedEvents?.forEach((event) => {
      const parsedEvent = event as ParsedEventLog;
      allEvents.push({
        ...event,
        type: 'ShareRequested',
        timestamp: parsedEvent.args?.timestamp,
        args: parsedEvent.args,
      } as DocumentEvent);
    });

    // Sort by timestamp
    return allEvents.sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));
  }, [
    documentId,
    documentRegisteredEvents,
    documentVerifiedEvents,
    documentSharedEvents,
    consentGrantedEvents,
    consentRevokedEvents,
    verificationRequestedEvents,
    shareRequestedEvents,
  ]);

  // Check if current user is holder or issuer
  const isHolder = address?.toLowerCase() === documentInfo?.holder?.toLowerCase();
  const isIssuer = address?.toLowerCase() === documentInfo?.issuer?.toLowerCase();

  const refetchAll = () => {
    refetchInfo();
  };

  const value: DocumentDetailsContextValue = {
    documentId,
    documentInfo,
    ipfsData,
    isLoading,
    error: error instanceof Error ? error : null,
    isHolder,
    isIssuer,
    events,
    refetchAll,
  };

  // Show error state if no document ID
  if (!documentId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Document Not Found</h2>
          <p className="text-muted-foreground">No document ID provided</p>
        </div>
      </div>
    );
  }

  return <DocumentDetailsContext.Provider value={value}>{children}</DocumentDetailsContext.Provider>;
}
